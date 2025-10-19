import * as core from '@actions/core'
import { Ajv, type AnySchemaObject } from 'ajv'
import { readFileSync } from 'fs'

/**
 * Validate JSON Files.
 *
 * @param {string[]} files JSON to validate.
 * @param {object} schema JSON schema to validate against.
 * @param {boolean} strict Whether to strictly validate the JSON.
 * @returns {Promise<string[]>} Resolves with the validation errors.
 */
export async function validateFiles(
  files: string[],
  schema: Record<string, unknown> | null,
  strict: boolean
): Promise<string[]> {
  const ajv = new Ajv({ strict, loadSchema })
  const validate = schema ? await ajv.compileAsync(schema) : ajv.compile(true)

  let filesErrors: string[] = []
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
    } catch (error) {
      filesErrors = filesErrors.concat(`${file}: ${(error as Error).message}`)
    }
  }

  return filesErrors
}

async function loadSchema(uri: string): Promise<AnySchemaObject> {
  const res = await fetch(uri)
  if (!res.ok) {
    throw new Error(`Failed to fetch schema ${uri}: ${res.statusText}`)
  }

  if (!res.body) {
    throw new Error(`No body in response for schema ${uri}`)
  }

  return res.body
}
