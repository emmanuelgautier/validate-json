/**
 * Unit tests for src/validate.ts, covering ajv-formats support.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const { validateFiles } = await import('../src/validate.js')

describe('validateFiles', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('validates a file against every ajv-formats format', async () => {
    const schema = JSON.parse(
      await import('fs').then((fs) =>
        fs.promises.readFile('__fixtures__/formats-schema.json', 'utf-8')
      )
    )

    const results = await validateFiles(
      ['__fixtures__/formats-valid.json'],
      schema,
      false
    )

    expect(results).toEqual([
      { file: '__fixtures__/formats-valid.json', errors: [] }
    ])
  })

  it('reports errors for a file that violates every ajv-formats format', async () => {
    const schema = JSON.parse(
      await import('fs').then((fs) =>
        fs.promises.readFile('__fixtures__/formats-schema.json', 'utf-8')
      )
    )

    const results = await validateFiles(
      ['__fixtures__/formats-invalid.json'],
      schema,
      false
    )

    expect(results).toHaveLength(1)
    expect(results[0].file).toBe('__fixtures__/formats-invalid.json')
    expect(results[0].errors).toHaveLength(1)
    expect(results[0].errors[0]).toBeTruthy()
  })

  it.each([
    ['date', '2026-08-23'],
    ['time', '14:22:00Z'],
    ['date-time', '2026-08-23T14:22:00Z'],
    ['iso-time', '14:22:00'],
    ['iso-date-time', '2026-08-23T14:22:00'],
    ['duration', 'P1Y2M3DT4H5M6S'],
    ['uri', 'https://example.com/path'],
    ['uri-reference', '/relative/path'],
    ['uri-template', 'https://example.com/{id}'],
    ['url', 'https://example.com'],
    ['email', 'user@example.com'],
    ['hostname', 'example.com'],
    ['ipv4', '192.168.1.1'],
    ['ipv6', '2001:db8::1'],
    ['regex', '^[a-z]+$'],
    ['uuid', '123e4567-e89b-12d3-a456-426614174000'],
    ['json-pointer', '/foo/bar'],
    ['relative-json-pointer', '1/foo'],
    ['byte', 'aGVsbG8='],
    ['password', 'p@ssw0rd'],
    ['binary', 'binarydata']
  ])('accepts a valid %s format', async (format, value) => {
    const { writeFileSync, unlinkSync } = await import('fs')
    const file = `__fixtures__/tmp-${format}.json`
    writeFileSync(file, JSON.stringify({ value }))

    const results = await validateFiles(
      [file],
      {
        type: 'object',
        properties: { value: { type: 'string', format } },
        required: ['value']
      },
      false
    )

    unlinkSync(file)

    expect(results).toEqual([{ file, errors: [] }])
  })

  it.each([
    ['int32', 100],
    ['int64', 123456789012],
    ['float', 1.5],
    ['double', 1.5]
  ])('accepts a valid %s format', async (format, value) => {
    const { writeFileSync, unlinkSync } = await import('fs')
    const file = `__fixtures__/tmp-${format}.json`
    writeFileSync(file, JSON.stringify({ value }))

    const results = await validateFiles(
      [file],
      {
        type: 'object',
        properties: {
          value: {
            type: format.startsWith('int') ? 'integer' : 'number',
            format
          }
        },
        required: ['value']
      },
      false
    )

    unlinkSync(file)

    expect(results).toEqual([{ file, errors: [] }])
  })
})
