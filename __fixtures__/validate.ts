import { jest } from '@jest/globals'

export const validateFiles =
  jest.fn<typeof import('../src/validate.js').validateFiles>()
