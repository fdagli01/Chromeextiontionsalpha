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

  it('returns a curated fact for a known Italian term', () => {
    expect(getFact('italian', 'legione')).toContain('lejyon')
  })

  it('is case-insensitive for Italian terms', () => {
    expect(getFact('italian', '  Aquila  ')).toContain('kartal')
  })

  it('returns a curated fact for a known Portuguese term', () => {
    expect(getFact('portuguese', 'caravela')).toContain('karavela')
  })

  it('returns a curated fact for a known French term', () => {
    expect(getFact('french', 'guillotine')).toContain('giyotin')
  })
})
