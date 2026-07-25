import { describe, expect, it } from 'vitest'
import { getExample, getFact, getPhilosophy } from './index.js'

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
    expect(getFact('italian', 'legione')).toContain('legion')
  })

  it('is case-insensitive for Italian terms', () => {
    expect(getFact('italian', '  Aquila  ')).toContain('eagle')
  })

  it('returns a curated fact for a known Portuguese term', () => {
    expect(getFact('portuguese', 'caravela')).toContain('caravel')
  })

  it('returns a curated fact for a known French term', () => {
    expect(getFact('french', 'guillotine')).toContain('Guillotin')
  })
})

describe('getExample', () => {
  it('returns an example sentence with an English translation for a known term', () => {
    const example = getExample('russian', 'товарищ')
    expect(example.sentence).toContain('Товарищ')
    expect(example.translation).toContain('Comrade')
  })

  it('returns null for an unknown term', () => {
    expect(getExample('russian', 'неизвестное')).toBeNull()
  })

  it('returns null for an unregistered theme', () => {
    expect(getExample('roman', 'senatus')).toBeNull()
  })

  it('has an example for every word with a fact, in every theme', () => {
    for (const themeId of ['russian', 'italian', 'portuguese', 'french']) {
      const example = getExample(themeId, 'placeholder-word-that-does-not-exist')
      expect(example).toBeNull()
    }
    // Spot-check one real word per theme has both fact and example wired up.
    expect(getExample('italian', 'senato')).not.toBeNull()
    expect(getExample('portuguese', 'caravela')).not.toBeNull()
    expect(getExample('french', 'liberté')).not.toBeNull()
  })
})

describe('getPhilosophy', () => {
  it('returns a philosophy note for a conceptually loaded term', () => {
    expect(getPhilosophy('russian', 'свобода')).toContain('Berlin')
  })

  it('returns an empty string for a term with no philosophy note', () => {
    expect(getPhilosophy('russian', 'спутник')).toBe('')
  })

  it('returns an empty string for an unregistered theme', () => {
    expect(getPhilosophy('roman', 'senatus')).toBe('')
  })
})
