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
    const errors = await validateFiles(files, schema, strictInput)
    if (errors.length > 0) {
      core.setOutput('valid', 'false')
      core.setOutput('errors', errors)
      core.setFailed('Validation failed!')

      for (const error of errors) {
        core.error(error)
      }
      return
    }

    core.info('Validation successful!')
    core.setOutput('valid', 'true')
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed((error as Error).message)
  }
}
