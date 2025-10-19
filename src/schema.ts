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
    schema = await fs.readFile(schemaInput, 'utf-8')
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

  const response = await fetch(schemaInput)
  const jsonSchema = await response.text()

  // TODO: Cache the schema

  return jsonSchema
}
