/**
 * Unit tests for the action's entrypoint, src/index.js
 */

import { run } from '../src/main'

// Mock the action's entrypoint
jest.mock('../src/main', () => ({
  run: jest.fn()
}))

describe('index', () => {
  it('calls run when imported', async () => {
    import('../src/main')

    expect(run).toHaveBeenCalled()
  })
})
