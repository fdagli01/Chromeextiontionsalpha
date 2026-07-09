import { describe, expect, it } from 'vitest'
import { getTransliteration } from './index.js'
import { transliterateRussian } from './russian.js'

describe('transliterateRussian', () => {
  it('maps common Cyrillic letters to Latin equivalents', () => {
    expect(transliterateRussian('радость')).toBe("radost'")
  })

  it('preserves capitalization of the first letter', () => {
    expect(transliterateRussian('Товарищ')).toBe('Tovarishch')
  })

  it('passes non-Cyrillic characters through unchanged', () => {
    expect(transliterateRussian('SSSR-1957')).toBe('SSSR-1957')
  })
})

describe('getTransliteration', () => {
  it('delegates to the Russian provider for the russian theme', () => {
    expect(getTransliteration('russian', 'мир')).toBe('mir')
  })

  it('returns an empty string for an unregistered theme', () => {
    expect(getTransliteration('roman', 'senatus')).toBe('')
  })
})
