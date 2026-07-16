import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { addWord, deleteWord, getDueWords, getWord, getWordsByTheme, reviewWord, updateWord } from './wordsRepo.js'
import { QUALITY } from '../srs/fsrs.js'
import { getProgress, saveProgress } from './progressRepo.js'
import { getSetting, setSetting } from './settingsRepo.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('wordsRepo', () => {
  it('adds a word with FSRS defaults and an auto id', async () => {
    const word = await addWord({ themeId: 'russian', term: 'товарищ', translation: 'comrade' })
    expect(word.id).toBeTypeOf('number')
    expect(word.difficulty).toBeUndefined()
    expect(word.stability).toBeUndefined()
    expect(word.interval).toBe(0)
    expect(word.dueDate).toBeTruthy()
  })

  it('round-trips through getWord', async () => {
    const word = await addWord({ themeId: 'russian', term: 'привет', translation: 'hello' })
    const fetched = await getWord(word.id)
    expect(fetched).toEqual(word)
  })

  it('updates a word and preserves untouched fields', async () => {
    const word = await addWord({ themeId: 'russian', term: 'да', translation: 'yes' })
    const updated = await updateWord(word.id, { difficulty: 5, interval: 6 })
    expect(updated.difficulty).toBe(5)
    expect(updated.interval).toBe(6)
    expect(updated.term).toBe('да')
  })

  it('deletes a word', async () => {
    const word = await addWord({ themeId: 'russian', term: 'нет', translation: 'no' })
    await deleteWord(word.id)
    expect(await getWord(word.id)).toBeUndefined()
  })

  it('filters words by theme', async () => {
    await addWord({ themeId: 'russian', term: 'один', translation: 'one' })
    await addWord({ themeId: 'roman', term: 'unus', translation: 'one' })
    const russian = await getWordsByTheme('russian')
    expect(russian).toHaveLength(1)
    expect(russian[0].term).toBe('один')
  })

  it('returns only due words, soonest first', async () => {
    const past = await addWord({ themeId: 'russian', term: 'вчера', translation: 'yesterday' })
    await updateWord(past.id, { dueDate: new Date(Date.now() - 60_000).toISOString() })

    const future = await addWord({ themeId: 'russian', term: 'завтра', translation: 'tomorrow' })
    await updateWord(future.id, { dueDate: new Date(Date.now() + 60_000).toISOString() })

    const due = await getDueWords('russian')
    expect(due.map((w) => w.term)).toEqual(['вчера'])
  })

  it('marks a word struggling on a missed recall and clears it on a correct one', async () => {
    const word = await addWord({ themeId: 'russian', term: 'легион', translation: 'legion' })
    expect(word.struggling).toBe(false)

    const missed = await reviewWord(word.id, QUALITY.AGAIN)
    expect(missed.struggling).toBe(true)

    const recalled = await reviewWord(word.id, QUALITY.GOOD)
    expect(recalled.struggling).toBe(false)
  })
})

describe('progressRepo', () => {
  it('returns default progress for an unseen theme', async () => {
    const progress = await getProgress('russian')
    expect(progress).toEqual({
      themeId: 'russian',
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: [],
      dailyQuestDate: null,
      dailyReviewCount: 0,
      dailyQuestClaimed: false,
      secretsUnlocked: [],
      streakShields: 0,
      dailyBestCombo: 0,
      dailyXp: 0,
    })
  })

  it('saves and merges progress updates', async () => {
    await saveProgress('russian', { xp: 50, streak: 1 })
    const updated = await saveProgress('russian', { xp: 70 })
    expect(updated).toEqual({
      themeId: 'russian',
      xp: 70,
      level: 1,
      streak: 1,
      lastActiveDate: null,
      badges: [],
      dailyQuestDate: null,
      dailyReviewCount: 0,
      dailyQuestClaimed: false,
      secretsUnlocked: [],
      streakShields: 0,
      dailyBestCombo: 0,
      dailyXp: 0,
    })
  })
})

describe('settingsRepo', () => {
  it('returns the default when unset', async () => {
    expect(await getSetting('radioEnabled', true)).toBe(true)
  })

  it('persists a setting', async () => {
    await setSetting('radioEnabled', false)
    expect(await getSetting('radioEnabled', true)).toBe(false)
  })
})
