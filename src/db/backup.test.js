import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { addWord, getWordsByTheme, updateWord } from './wordsRepo.js'
import { saveProgress } from './progressRepo.js'
import { exportBackup, importBackup } from './backup.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('exportBackup / importBackup', () => {
  it('round-trips words and progress through export then import', async () => {
    const word = await addWord({ themeId: 'russian', term: 'мир', translation: 'peace' })
    await updateWord(word.id, { repetition: 3, easeFactor: 2.8 })
    await saveProgress('russian', { xp: 120, level: 2, streak: 4 })

    const backup = await exportBackup()
    expect(backup.words).toHaveLength(1)
    expect(backup.words[0]).not.toHaveProperty('id')
    expect(backup.progress.find((p) => p.themeId === 'russian').xp).toBe(120)

    // Simulate a fresh install: new empty database.
    indexedDB = new IDBFactory()
    _resetConnectionForTests()

    const { wordsImported, progressImported } = await importBackup(backup)
    expect(wordsImported).toBe(1)
    expect(progressImported).toBeGreaterThan(0)

    const restored = await getWordsByTheme('russian')
    expect(restored).toHaveLength(1)
    expect(restored[0].term).toBe('мир')
    expect(restored[0].repetition).toBe(3)
    expect(restored[0].easeFactor).toBe(2.8)
    expect(restored[0].id).toBeTypeOf('number')
  })

  it('is additive: importing twice does not remove or overwrite existing words', async () => {
    await addWord({ themeId: 'russian', term: 'а', translation: 'and' })
    const backup = await exportBackup()

    await importBackup(backup)
    const words = await getWordsByTheme('russian')
    expect(words).toHaveLength(2)
  })

  it('rejects a backup with no words array', async () => {
    await expect(importBackup({ progress: [] })).rejects.toThrow()
  })
})
