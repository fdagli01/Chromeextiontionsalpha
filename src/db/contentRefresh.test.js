import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { addWord, getWord } from './wordsRepo.js'
import { refreshCuratedContent } from './contentRefresh.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
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
})
