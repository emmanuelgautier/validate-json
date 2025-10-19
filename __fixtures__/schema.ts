import { jest } from '@jest/globals'

export const readSchema =
  jest.fn<typeof import('../src/schema.js').readSchema>()
