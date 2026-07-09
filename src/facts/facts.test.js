import { describe, expect, it } from 'vitest'
import { getFact } from './index.js'

describe('getFact', () => {
  it('returns a curated fact for a known Russian term', () => {
    expect(getFact('russian', 'спутник')).toContain('Sputnik')
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(getFact('russian', '  Спутник  ')).toContain('Sputnik')
  })

  it('returns an empty string for an unknown term', () => {
    expect(getFact('russian', 'неизвестное')).toBe('')
  })

  it('returns an empty string for an unregistered theme', () => {
    expect(getFact('roman', 'senatus')).toBe('')
  })
})
