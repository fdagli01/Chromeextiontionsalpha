import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { addWord, getWord } from './wordsRepo.js'
import { setSetting } from './settingsRepo.js'
import { refreshCuratedContent } from './contentRefresh.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('refreshCuratedContent', () => {
  it('backfills missing fact/example/philosophy/transliteration for a known term', async () => {
    // Captured before these fields existed for this theme/term, so they're empty.
    const word = await addWord({ themeId: 'russian', term: 'свобода', translation: 'freedom' })
    expect(word.fact).toBe('')
    expect(word.exampleSentence).toBe('')
    expect(word.philosophyNote).toBe('')
    expect(word.transliteration).toBe('')

    const { total, updated } = await refreshCuratedContent()
    expect(total).toBe(1)
    expect(updated).toBe(1)

    const refreshed = await getWord(word.id)
    expect(refreshed.fact).not.toBe('')
    expect(refreshed.exampleSentence).not.toBe('')
    expect(refreshed.philosophyNote).not.toBe('')
    expect(refreshed.transliteration).toBe("svoboda")
  })

  it('does not overwrite content the word already has', async () => {
    const word = await addWord({
      themeId: 'russian',
      term: 'свобода',
      translation: 'freedom',
      fact: 'custom fact the user already saw',
    })

    const { updated } = await refreshCuratedContent()
    expect(updated).toBe(1) // example/philosophy/transliteration still missing

    const refreshed = await getWord(word.id)
    expect(refreshed.fact).toBe('custom fact the user already saw')
    expect(refreshed.exampleSentence).not.toBe('')
  })

  it('leaves fact/example/philosophy empty for a term with no curated entry', async () => {
    // Transliteration is a generic letter-mapping, not curated, so it still
    // fills in even for unknown words — only the curated fields stay empty.
    const word = await addWord({ themeId: 'russian', term: 'абракадабра', translation: 'gibberish' })
    await refreshCuratedContent()

    const refreshed = await getWord(word.id)
    expect(refreshed.fact).toBe('')
    expect(refreshed.exampleSentence).toBe('')
    expect(refreshed.philosophyNote).toBe('')
  })

  it('leaves a term with no curated entry untouched when the AI engine is disabled', async () => {
    global.fetch = vi.fn()
    const word = await addWord({ themeId: 'russian', term: 'абракадабра', translation: 'gibberish' })
    await refreshCuratedContent()

    expect(fetch).not.toHaveBeenCalled()
    const refreshed = await getWord(word.id)
    expect(refreshed.fact).toBe('')
  })

  it('falls back to the AI chronicle engine for a term with no curated entry when enabled', async () => {
    await setSetting('aiEngineEnabled', true)
    await setSetting('aiEngineApiKey', 'sk-ant-test')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            text: JSON.stringify({
              sentence: 'Абракадабра не является настоящим словом.',
              translation: 'Abracadabra is not a real word.',
              chronicle_insight: 'A placeholder nonsense-word, useful only for testing.',
            }),
          },
        ],
      }),
    })

    const word = await addWord({ themeId: 'russian', term: 'абракадабра', translation: 'gibberish' })
    const { updated } = await refreshCuratedContent()

    expect(updated).toBe(1)
    const refreshed = await getWord(word.id)
    expect(refreshed.fact).toBe('A placeholder nonsense-word, useful only for testing.')
    expect(refreshed.exampleSentence).toBe('Абракадабра не является настоящим словом.')
    expect(refreshed.exampleTranslation).toBe('Abracadabra is not a real word.')
  })
})
