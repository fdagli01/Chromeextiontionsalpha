import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { saveProgress } from '../db/progressRepo.js'
import { listThemes } from '../themes/index.js'
import { ACTS, getPendingAct, markActSeen } from './acts.js'
import { MASTERY_TIERS, masteryForWord, masterySummary } from '../srs/mastery.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('ACTS', () => {
  it('gives every theme three acts, in ascending level order, all fully written', () => {
    for (const theme of listThemes()) {
      const acts = ACTS[theme.id]
      expect(acts, theme.id).toHaveLength(3)
      const levels = acts.map((a) => a.minLevel)
      expect(levels).toEqual([...levels].sort((a, b) => a - b))
      for (const act of acts) {
        expect(act.dateline.length).toBeGreaterThan(5)
        expect(act.title.length).toBeGreaterThan(3)
        expect(act.body.length).toBeGreaterThan(80)
        expect(act.standing.length).toBeGreaterThan(10)
      }
    }
  })

  it('uses unique act ids across every theme', () => {
    const ids = Object.values(ACTS).flat().map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getPendingAct', () => {
  it('is null below the first threshold', async () => {
    expect(await getPendingAct('russian')).toBeNull()
  })

  it('returns the earliest unseen act, so a multi-level jump misses nothing', async () => {
    await saveProgress('russian', { level: 20 })
    const first = await getPendingAct('russian')
    expect(first.id).toBe('ru-act-1')

    await markActSeen('russian', first.id)
    expect((await getPendingAct('russian')).id).toBe('ru-act-2')
  })

  it('stops returning an act once seen, and never repeats it', async () => {
    await saveProgress('russian', { level: 4 })
    const act = await getPendingAct('russian')
    await markActSeen('russian', act.id)
    await markActSeen('russian', act.id)
    expect(await getPendingAct('russian')).toBeNull()
  })
})

describe('masteryForWord', () => {
  it('awards nothing to a word that was never actually reviewed', () => {
    expect(masteryForWord({ stability: 999, lastReviewedAt: null })).toBeNull()
    expect(masteryForWord({ lastReviewedAt: '2026-01-01' })).toBeNull()
  })

  it('awards the highest tier the stability qualifies for', () => {
    const at = '2026-01-01T00:00:00Z'
    expect(masteryForWord({ stability: 6, lastReviewedAt: at })).toBeNull()
    expect(masteryForWord({ stability: 7, lastReviewedAt: at }).id).toBe('bronze')
    expect(masteryForWord({ stability: 30, lastReviewedAt: at }).id).toBe('silver')
    expect(masteryForWord({ stability: 400, lastReviewedAt: at }).id).toBe('gold')
  })

  it('lists tiers highest-first so the find() picks the best match', () => {
    expect(MASTERY_TIERS.map((t) => t.id)).toEqual(['gold', 'silver', 'bronze'])
  })
})

describe('masterySummary', () => {
  it('counts each tier and the archive total', () => {
    const at = '2026-01-01T00:00:00Z'
    const summary = masterySummary([
      { stability: 120, lastReviewedAt: at },
      { stability: 45, lastReviewedAt: at },
      { stability: 8, lastReviewedAt: at },
      { stability: 2, lastReviewedAt: at },
      { stability: undefined, lastReviewedAt: null },
    ])
    expect(summary).toEqual({ gold: 1, silver: 1, bronze: 1, total: 5 })
  })
})
