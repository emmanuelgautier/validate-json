import * as core from '@actions/core'
import { Ajv, type AnySchemaObject, type Plugin } from 'ajv'
import addFormatsPlugin, { type FormatsPluginOptions } from 'ajv-formats'
import { readFileSync } from 'fs'

// The ajv-formats default export loses its call signature under NodeNext
// module resolution (https://github.com/ajv-validator/ajv-formats/issues/153).
const addFormats = addFormatsPlugin as unknown as Plugin<FormatsPluginOptions>

export interface FileResult {
  file: string
  errors: string[]
}

/**
 * Validate JSON Files.
 *
 * @param {string[]} files JSON to validate.
 * @param {object} schema JSON schema to validate against.
 * @param {boolean} strict Whether to strictly validate the JSON.
 * @returns {Promise<FileResult[]>} Resolves with per-file validation results.
 */
export async function validateFiles(
  files: string[],
  schema: Record<string, unknown> | null,
  strict: boolean
): Promise<FileResult[]> {
  const ajv = new Ajv({ strict, loadSchema })
  addFormats(ajv)
  const validate = schema ? await ajv.compileAsync(schema) : ajv.compile(true)

  const results: FileResult[] = []
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8'))
      if (!data) {
        throw new Error(`Failed to read file: ${file}`)
      }

      const isValid = validate(data)
      core.debug(`Validation result for ${file}: ${isValid}`)

      if (!isValid) {
        throw new Error(ajv.errorsText(validate.errors))
      }

      results.push({ file, errors: [] })
    } catch (error) {
      results.push({ file, errors: [(error as Error).message] })
    }
  }

  return results
}

async function loadSchema(uri: string): Promise<AnySchemaObject> {
  core.debug(`Fetching schema ${uri}`)

  const res = await fetch(uri)
  if (!res.ok) {
    throw new Error(`Failed to fetch schema ${uri}: ${res.statusText}`)
  }
  core.debug(`Response status for schema ${uri}: ${res.status}`)

  if (!res.body) {
    throw new Error(`No body in response for schema ${uri}`)
  }

  core.debug(`Fetched schema ${uri}`)

  return res.body
}
