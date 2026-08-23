/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('sets the valid output', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__fixtures__/valid.json'
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.debug).toHaveBeenNthCalledWith(1, 'strict: false')
    expect(core.debug).toHaveBeenNthCalledWith(
      2,
      'files: __fixtures__/valid.json'
    )
    expect(core.info).toHaveBeenNthCalledWith(1, 'Validation successful!')
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'valid', 'true')
  })

  it('sets the valid output with schema input', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__fixtures__/valid.json'
        case 'schema':
          return '__fixtures__/schema.json'
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.debug).toHaveBeenNthCalledWith(1, 'strict: false')
    expect(core.debug).toHaveBeenNthCalledWith(
      2,
      'files: __fixtures__/valid.json'
    )
    expect(core.info).toHaveBeenNthCalledWith(1, 'Validation successful!')
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'valid', 'true')
  })

  it('sets errors when json is invalid', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__fixtures__/invalid.json'
        case 'schema':
          return '__fixtures__/schema.json'
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.debug).toHaveBeenNthCalledWith(1, 'strict: false')
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'valid', 'false')
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Validation failed!')
    expect(core.error).toHaveBeenNthCalledWith(
      1,
      `__fixtures__/invalid.json: data must have required property 'productName'`
    )
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          throw new Error('Input required and not supplied: files')
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: files'
    )
  })

  it('logs per-file valid messages and summary when multiple files all pass', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__fixtures__/valid{,2}.json'
        case 'schema':
          return '__fixtures__/schema.json'
        default:
          return ''
      }
    })

    await run()

    // Each matched file should produce an individual "valid" info line
    const infoCalls = core.info.mock.calls.map((c) => c[0])
    expect(
      infoCalls.some((msg) =>
        (msg as string).includes('__fixtures__/valid.json: valid')
      )
    ).toBe(true)
    expect(
      infoCalls.some((msg) =>
        (msg as string).includes('__fixtures__/valid2.json: valid')
      )
    ).toBe(true)
    // Summary line should be present
    expect(
      infoCalls.some((msg) => (msg as string).startsWith('Summary:'))
    ).toBe(true)
    expect(
      infoCalls.some((msg) =>
        (msg as string).includes('2 file(s) checked, all valid')
      )
    ).toBe(true)
    // Global success line
    expect(infoCalls.some((msg) => msg === 'Validation successful!')).toBe(true)
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'valid', 'true')
  })

  it('logs per-file messages and summary when multiple files and some are invalid', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'files':
          // matches both valid.json and invalid.json
          return '__fixtures__/{valid,invalid}.json'
        case 'schema':
          return '__fixtures__/schema.json'
        default:
          return ''
      }
    })

    await run()

    // The invalid file should have been logged as an error
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining(`__fixtures__/invalid.json`)
    )
    // The valid file should have produced a "valid" info line
    const infoCalls = core.info.mock.calls.map((c) => c[0])
    expect(
      infoCalls.some((msg) =>
        (msg as string).includes('__fixtures__/valid.json: valid')
      )
    ).toBe(true)
    // Summary line should report 1 valid, 1 invalid
    expect(
      infoCalls.some(
        (msg) =>
          (msg as string).includes('1 file(s) valid') &&
          (msg as string).includes('1 file(s) invalid')
      )
    ).toBe(true)
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'valid', 'false')
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Validation failed!')
  })
})
