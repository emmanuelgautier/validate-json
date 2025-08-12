/**
 * Unit tests for the action's main functionality, src/main.js
 */
import * as core from '@actions/core'
import main from '../src/main'

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const errorMock = jest.spyOn(core, 'error').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the valid output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__fixtures__/valid.json'
        case 'schema':
          return '__fixtures__/schema.json'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'strict: false')
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'valid', 'true')
  })

  it('sets errors when json is invalid', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'files':
          return '__tests__/fixtures/invalid.json'
        case 'schema':
          return '__tests__/fixtures/schema.json'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'strict: false')
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'valid', 'false')
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Validation failed!')
    expect(errorMock).toHaveBeenNthCalledWith(
      1,
      `__tests__/fixtures/invalid.json: data must have required property 'productName'`
    )
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'files':
          throw new Error('Input required and not supplied: files')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: files'
    )
  })
})
