import * as core from '@actions/core'
import { glob } from 'glob'
import { readSchema } from './schema.js'
import { validateFiles } from './validate.js'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    const filesInput = core.getInput('files', { required: true })
    const schemaInput = core.getInput('schema', { required: false })
    const strictInput = core.getInput('strict', { required: false }) === 'true'

    core.debug(`strict: ${strictInput}`)

    const files = glob.sync(filesInput)
    core.debug(`files: ${files}`)

    const schema = schemaInput ? await readSchema(schemaInput) : null
    const results = await validateFiles(files, schema, strictInput)

    const multipleFiles = files.length > 1

    // Per-file output (only when several files matched)
    if (multipleFiles) {
      for (const result of results) {
        if (result.errors.length === 0) {
          core.info(`${result.file}: valid`)
        } else {
          for (const err of result.errors) {
            core.error(`${result.file}: ${err}`)
          }
        }
      }
    }

    const allErrors = results.flatMap((r) =>
      r.errors.map((err) => `${r.file}: ${err}`)
    )

    if (allErrors.length > 0) {
      // Summary
      if (multipleFiles) {
        const validCount = results.filter((r) => r.errors.length === 0).length
        const invalidCount = results.length - validCount
        core.info(
          `Summary: ${validCount} file(s) valid, ${invalidCount} file(s) invalid out of ${results.length} file(s) checked.`
        )
      }

      core.setOutput('valid', 'false')
      core.setOutput('errors', allErrors)
      core.setFailed('Validation failed!')

      // Single-file: emit the error message (multi-file already logged above)
      if (!multipleFiles) {
        for (const err of allErrors) {
          core.error(err)
        }
      }
      return
    }

    // Summary for successful multi-file run
    if (multipleFiles) {
      core.info(`Summary: ${results.length} file(s) checked, all valid.`)
    }

    core.info('Validation successful!')
    core.setOutput('valid', 'true')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed((error as Error).message)
  }
}
