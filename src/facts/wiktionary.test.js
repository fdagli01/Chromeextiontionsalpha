import { describe, expect, it, vi } from 'vitest'
import { lookupWiktionary, pickEntry, stripMarkup, toWordFields } from './wiktionary.js'

/**
 * Payloads mirror the shape of Wiktionary's REST definition endpoint:
 * top-level keys are language codes, each holding part-of-speech sections
 * whose `definitions` carry HTML text and optional examples.
 */
const casaPayload = {
  es: [
    {
      partOfSpeech: 'Noun',
      language: 'Spanish',
      definitions: [
        {
          definition: '<span class="use-with-mention">house</span>',
          parsedExamples: [{ example: '<i>Mi <b>casa</b> es tu casa.</i>', translation: 'My house is your house.' }],
        },
      ],
    },
  ],
  it: [
    {
      partOfSpeech: 'Noun',
      definitions: [{ definition: 'house, home' }],
    },
  ],
}

describe('stripMarkup', () => {
  it('removes tags and decodes the entities the API actually emits', () => {
    expect(stripMarkup('<i>a <b>bold</b> claim</i>')).toBe('a bold claim')
    expect(stripMarkup('&quot;quoted&quot; &amp; &#39;single&#39;')).toBe('"quoted" & \'single\'')
    expect(stripMarkup('  spaced   \n out  ')).toBe('spaced out')
  })

  it('is safe on non-string input', () => {
    expect(stripMarkup(undefined)).toBe('')
    expect(stripMarkup(null)).toBe('')
    expect(stripMarkup(42)).toBe('')
  })
})

describe('pickEntry', () => {
  it('reads the section matching the theme language, not just the first one', () => {
    expect(pickEntry(casaPayload, 'es').definition).toBe('house')
    expect(pickEntry(casaPayload, 'it').definition).toBe('house, home')
  })

  it('prefers a sense that carries a usage example', () => {
    const payload = {
      fr: [
        {
          partOfSpeech: 'Noun',
          definitions: [
            { definition: 'a bare gloss' },
            { definition: 'the useful sense', examples: ['<i>Un exemple.</i>'] },
          ],
        },
      ],
    }
    const entry = pickEntry(payload, 'fr')
    expect(entry.definition).toBe('the useful sense')
    expect(entry.example).toBe('Un exemple.')
  })

  it('falls back to a bare gloss when nothing has an example', () => {
    const payload = { pt: [{ partOfSpeech: 'Verb', definitions: [{ definition: 'to pull' }] }] }
    const entry = pickEntry(payload, 'pt')
    expect(entry.definition).toBe('to pull')
    expect(entry.example).toBe('')
  })

  it('returns null for a language the payload does not cover', () => {
    expect(pickEntry(casaPayload, 'ru')).toBeNull()
    expect(pickEntry({}, 'es')).toBeNull()
    expect(pickEntry(null, 'es')).toBeNull()
  })

  it('skips senses whose definition is empty once markup is stripped', () => {
    const payload = { ru: [{ partOfSpeech: 'Noun', definitions: [{ definition: '<span></span>' }, { definition: 'shop' }] }] }
    expect(pickEntry(payload, 'ru').definition).toBe('shop')
  })
})

describe('toWordFields', () => {
  it('phrases the fact as archive intel, prefixed by part of speech', () => {
    const fields = toWordFields({ definition: 'house', partOfSpeech: 'Noun', example: 'Mi casa.', exampleTranslation: 'My house.' })
    expect(fields.fact).toBe('noun · house')
    expect(fields.exampleSentence).toBe('Mi casa.')
    expect(fields.definition).toBe('house')
  })

  it('omits the prefix when part of speech is unknown', () => {
    expect(toWordFields({ definition: 'house', partOfSpeech: '', example: '', exampleTranslation: '' }).fact).toBe('house')
  })
})

describe('lookupWiktionary', () => {
  it('returns usable fields for a hit', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(casaPayload) }))
    const result = await lookupWiktionary('casa', 'es', fetchImpl)
    expect(result.definition).toBe('house')
    expect(result.exampleSentence).toBe('Mi casa es tu casa.')
    expect(result.exampleTranslation).toBe('My house is your house.')
  })

  it('lowercases and underscores the title, and encodes non-Latin scripts', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    await lookupWiktionary('  No Pasarán  ', 'es', fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toMatch(/no_pasar%C3%A1n$/)

    await lookupWiktionary('товарищ', 'ru', fetchImpl)
    expect(fetchImpl.mock.calls[1][0]).toMatch(/%D1%82%D0%BE%D0%B2/)
  })

  it('identifies the client, as Wikimedia asks', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    await lookupWiktionary('casa', 'es', fetchImpl)
    expect(fetchImpl.mock.calls[0][1].headers['Api-User-Agent']).toContain('PolyglotChronicle')
  })

  // Enrichment is a bonus on an already-saved word: nothing here may throw.
  it('returns null rather than throwing on a miss, an outage or a shape change', async () => {
    expect(await lookupWiktionary('x', 'es', () => Promise.resolve({ ok: false, status: 404 }))).toBeNull()
    expect(await lookupWiktionary('x', 'es', () => Promise.reject(new Error('offline')))).toBeNull()
    expect(await lookupWiktionary('x', 'es', () => Promise.resolve({ ok: true, json: () => Promise.resolve('nonsense') }))).toBeNull()
    expect(
      await lookupWiktionary('x', 'es', () => Promise.resolve({ ok: true, json: () => Promise.reject(new Error('bad json')) }))
    ).toBeNull()
  })

  it('does not call the network for an empty term or an unsupported language', async () => {
    const fetchImpl = vi.fn()
    expect(await lookupWiktionary('   ', 'es', fetchImpl)).toBeNull()
    expect(await lookupWiktionary('casa', 'de', fetchImpl)).toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
