const fs = require('fs').promises

const isUrl = string => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Read or Download JSON Schema.
 *
 * @param {string} schemaInput The schema input.
 * @returns {Promise<string>} Resolves with the schema content.
 */
async function readSchema(schemaInput) {
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
async function downloadSchema(schemaInput) {
  // TODO: Test if the schema exists in the cache.

  const response = await fetch(schemaInput)
  const jsonSchema = await response.text()

  // TODO: Cache the schema

  return jsonSchema
}

module.exports = { readSchema }
