const core = require('@actions/core')
const Ajv = require('ajv')
const { readFileSync } = require('fs')

/**
 * Validate JSON Files.
 *
 * @param {string[]} files JSON to validate.
 * @param {object} schema JSON schema to validate against.
 * @param {boolean} strict Whether to strictly validate the JSON.
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
async function validateFiles(files, schema, strict) {
  const ajv = new Ajv({ strict, loadSchema })
  const validate = await ajv.compileAsync(schema || true)

  let filesErrors = []
  for (const file of files) {
    const data = JSON.parse(readFileSync(file, 'utf-8'))
    if (!data) {
      throw new Error(`Failed to read file: ${file}`)
    }

    const isValid = validate(data)
    core.debug(`Validation result for ${file}: ${isValid}`)

    if (!isValid) {
      filesErrors = filesErrors.concat(
        `${file}: ${ajv.errorsText(validate.errors)}`
      )
    }
  }

  return filesErrors
}

async function loadSchema(uri) {
  const res = await fetch(uri)
  if (!res.ok) {
    throw new Error(`Failed to fetch schema ${uri}: ${res.statusText}`)
  }

  return res.body
}

module.exports = { validateFiles }
