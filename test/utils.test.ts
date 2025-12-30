import { assert, describe, expect, it } from 'vitest'
import { isNumber, formatDuration } from '../src/utils/index.ts'

describe('utils', () => {
  it('isNumber', () => {
    assert.equal(isNumber(123), true)
    assert.equal(isNumber(NaN), false)
    assert.equal(isNumber('123'), false)

    expect(isNumber(0)).toMatchSnapshot('true')
  })

  it('formatDuration', () => {
    expect(formatDuration(3661000)).toBe('1h1min1s')
    expect(formatDuration(60000)).toBe('1min')
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(500)).toBe('500ms')

    expect(formatDuration(0)).toMatchSnapshot('"0ms"')
  })
})