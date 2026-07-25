import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from './connection.js'
import { seedSampleWords } from './seedWords.js'
import { getWordsByTheme } from './wordsRepo.js'
import { listThemes } from '../themes/index.js'
import { findFalseFriend } from '../progression/falseFriends.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('seedSampleWords', () => {
  it('gives every theme a substantial starting archive', async () => {
    for (const theme of listThemes()) {
      const { added } = await seedSampleWords(theme.id)
      expect(added, theme.id).toBeGreaterThanOrEqual(20)
    }
  })

  it('attaches curated trivia and transliteration to every seeded word', async () => {
    await seedSampleWords('russian')
    const words = await getWordsByTheme('russian')
    // Curated content is the whole point of seeding rather than capturing.
    expect(words.every((w) => w.fact && w.fact.length > 0)).toBe(true)
    expect(words.every((w) => w.transliteration && w.transliteration.length > 0)).toBe(true)
  })

  it('includes false friends so the double-agent mechanic can fire immediately', async () => {
    for (const theme of listThemes()) {
      await seedSampleWords(theme.id)
      const words = await getWordsByTheme(theme.id)
      const traps = words.filter((w) => findFalseFriend(theme.id, w.term))
      expect(traps.length, theme.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('is idempotent — re-seeding adds nothing and duplicates nothing', async () => {
    await seedSampleWords('french')
    const before = await getWordsByTheme('french')
    const { added } = await seedSampleWords('french')
    expect(added).toBe(0)
    expect(await getWordsByTheme('french')).toHaveLength(before.length)
  })

  it('returns zeroes for an unknown theme', async () => {
    expect(await seedSampleWords('klingon')).toEqual({ total: 0, added: 0 })
  })
})
