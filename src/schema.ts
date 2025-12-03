import * as core from '@actions/core'
import { promises as fs } from 'fs'

const isUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Read or Download JSON Schema.
 *
 * @param {string} schemaInput The schema input.
 * @returns {Promise<string>} Resolves with the schema content.
 */
export async function readSchema(schemaInput: string) {
  let schema
  if (isUrl(schemaInput)) {
    schema = await downloadSchema(schemaInput)
  } else {
    core.debug(`Reading schema file ${schemaInput}`)
    schema = await fs.readFile(schemaInput, 'utf-8')
    core.debug(`Read schema file ${schemaInput}`)
  }

  if (!schema) {
    throw new Error(`Schema not found: ${schemaInput}`)
  }

  return JSON.parse(schema)
}

/**
 * Download JSON Schema and cache it.
 *
 * @param {string} schemaInput The schema input URL.
 * @returns
 */
async function downloadSchema(schemaInput: string) {
  // TODO: Test if the schema exists in the cache.

  core.debug(`Fetching schema ${schemaInput}`)

  const response = await fetch(schemaInput)
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.statusText}`)
  }
  core.debug(`Response status for schema ${schemaInput}: ${response.status}`)

  const jsonSchema = await response.text()
  core.debug(`JSON schema for schema ${schemaInput}: ${jsonSchema}`)

  core.debug(`Fetched schema ${schemaInput}`)

  // TODO: Cache the schema

  return jsonSchema
}
