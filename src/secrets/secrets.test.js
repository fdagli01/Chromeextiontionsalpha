import { describe, expect, it } from 'vitest'
import { SECRETS, findSecretForTerm, getSecretsForTheme } from './secrets.js'
import { listThemes } from '../themes/index.js'

describe('SECRETS', () => {
  it('is fully populated and keyed by lowercase terms', () => {
    expect(SECRETS.length).toBeGreaterThan(0)
    for (const secret of SECRETS) {
      expect(secret.term).toBe(secret.term.toLowerCase())
      expect(secret.title.length).toBeGreaterThan(0)
      expect(secret.icon.length).toBeGreaterThan(0)
      expect(secret.anecdote.length).toBeGreaterThan(20)
    }
  })

  it('references only real themes, with no duplicate term per theme', () => {
    const themeIds = new Set(listThemes().map((t) => t.id))
    const seen = new Set()
    for (const secret of SECRETS) {
      expect(themeIds.has(secret.themeId), secret.themeId).toBe(true)
      const key = `${secret.themeId}:${secret.term}`
      expect(seen.has(key), key).toBe(false)
      seen.add(key)
    }
  })

  it('never uses a seed word — a secret everyone gets for free is not a secret', async () => {
    const { _resetConnectionForTests } = await import('../db/connection.js')
    indexedDB = new IDBFactory()
    _resetConnectionForTests()
    const { seedSampleWords } = await import('../db/seedWords.js')
    const { getWordsByTheme } = await import('../db/wordsRepo.js')

    for (const theme of listThemes()) {
      await seedSampleWords(theme.id)
      const seeded = new Set((await getWordsByTheme(theme.id)).map((w) => w.term.trim().toLowerCase()))
      for (const secret of getSecretsForTheme(theme.id)) {
        expect(seeded.has(secret.term), `${theme.id}:${secret.term}`).toBe(false)
      }
    }
  })
})

describe('findSecretForTerm', () => {
  it('matches case-insensitively and ignores surrounding whitespace', () => {
    const secret = SECRETS[0]
    expect(findSecretForTerm(secret.themeId, secret.term)).toBe(secret)
    expect(findSecretForTerm(secret.themeId, `  ${secret.term.toUpperCase()}  `)).toBe(secret)
  })

  it('is scoped per theme — the same term under another era does not match', () => {
    const secret = SECRETS[0]
    const otherTheme = listThemes().find((t) => t.id !== secret.themeId)
    expect(findSecretForTerm(otherTheme.id, secret.term)).toBeUndefined()
  })

  it('returns undefined for an unknown term', () => {
    expect(findSecretForTerm('russian', 'definitely-not-a-secret')).toBeUndefined()
  })
})

describe('getSecretsForTheme', () => {
  it('returns only that theme\'s secrets, and nothing for an unknown theme', () => {
    for (const theme of listThemes()) {
      expect(getSecretsForTheme(theme.id).every((s) => s.themeId === theme.id)).toBe(true)
    }
    expect(getSecretsForTheme('klingon')).toEqual([])
  })
})
