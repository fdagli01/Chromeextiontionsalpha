import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { saveProgress } from '../db/progressRepo.js'
import { recordDecision } from './decisions.js'
import { getDistinctions, getDistinctionsForOtherThemes, suggestNextEra } from './distinctions.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('getDistinctions', () => {
  it('is empty until an era is actually finished', async () => {
    await saveProgress('russian', { level: 20, lifetimeReviews: 500 })
    expect(await getDistinctions()).toEqual([])
  })

  it('records the era, its emblem and the epilogue actually earned', async () => {
    await recordDecision('russian', 'ending', 'russian:archivist')
    const [distinction] = await getDistinctions()
    expect(distinction.themeId).toBe('russian')
    expect(distinction.themeName).toBe('K.G.B. TERMINAL')
    expect(distinction.emblem).toBeTruthy()
    expect(distinction.endingTitle).toBe('THE KEEPER')
  })

  it('orders them by when each file was closed', async () => {
    await recordDecision('french', 'ending', 'french:witness', new Date('2026-03-01T00:00:00Z'))
    await recordDecision('russian', 'ending', 'russian:archivist', new Date('2026-01-01T00:00:00Z'))
    expect((await getDistinctions()).map((d) => d.themeId)).toEqual(['russian', 'french'])
  })
})

describe('getDistinctionsForOtherThemes', () => {
  it("omits the current era, whose ending is already its dossier's headline", async () => {
    await recordDecision('russian', 'ending', 'russian:archivist')
    await recordDecision('french', 'ending', 'french:witness')

    expect((await getDistinctionsForOtherThemes('russian')).map((d) => d.themeId)).toEqual(['french'])
    expect((await getDistinctionsForOtherThemes('italian')).map((d) => d.themeId).sort()).toEqual(['french', 'russian'])
  })
})

describe('suggestNextEra', () => {
  it('offers the least-played unfinished era, so it is a genuine fresh start', async () => {
    await saveProgress('italian', { lifetimeReviews: 200 })
    await saveProgress('french', { lifetimeReviews: 3 })
    await saveProgress('portuguese', { lifetimeReviews: 40 })
    await saveProgress('spanish', { lifetimeReviews: 90 })

    const next = await suggestNextEra('russian')
    expect(next.themeId).toBe('french')
    expect(next.themeName).toBeTruthy()
    expect(next.era).toBeTruthy()
  })

  it('never suggests the era just finished, nor one already closed', async () => {
    await recordDecision('french', 'ending', 'french:witness')
    await saveProgress('french', { lifetimeReviews: 0 })
    const next = await suggestNextEra('russian')
    expect(next.themeId).not.toBe('french')
    expect(next.themeId).not.toBe('russian')
  })

  it('returns null once every era is closed', async () => {
    for (const [themeId, endingId] of [
      ['russian', 'russian:archivist'],
      ['french', 'french:witness'],
      ['italian', 'italian:chronicler'],
      ['portuguese', 'portuguese:cartographer'],
      ['spanish', 'spanish:witness'],
    ]) {
      await recordDecision(themeId, 'ending', endingId)
    }
    expect(await suggestNextEra('russian')).toBeNull()
  })
})
