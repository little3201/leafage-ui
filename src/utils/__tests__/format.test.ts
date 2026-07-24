import { describe, expect, it } from 'vitest'
import { formatDuration } from '../format.ts'

describe('utils', () => {
  it('formatDuration', () => {
    expect(formatDuration(3_661_000)).toBe('1h1min1s')
    expect(formatDuration(60_000)).toBe('1min')
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(500)).toBe('500ms')

    expect(formatDuration(0)).toBe('0ms')
  })
})
