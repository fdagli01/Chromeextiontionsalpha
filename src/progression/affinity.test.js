import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getAffinityRecord, STARTING_TRUST } from '../db/affinityRepo.js'
import {
  addTrust,
  applyFactionTrustEvent,
  DAILY_TRUST_CAP,
  markAllyRewardClaimed,
  tierForTrust,
  TRUST_TIERS,
} from './affinity.js'

const DAY1 = new Date('2026-07-17T12:00:00Z')
const DAY2 = new Date('2026-07-18T12:00:00Z')

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('tierForTrust', () => {
  it('resolves the correct tier at each boundary', () => {
    expect(tierForTrust(0).id).toBe('suspicious')
    expect(tierForTrust(24).id).toBe('suspicious')
    expect(tierForTrust(25).id).toBe('neutral')
    expect(tierForTrust(49).id).toBe('neutral')
    expect(tierForTrust(50).id).toBe('warm')
    expect(tierForTrust(74).id).toBe('warm')
    expect(tierForTrust(75).id).toBe('ally')
    expect(tierForTrust(100).id).toBe('ally')
  })
})

describe('addTrust', () => {
  it('starts every persona at STARTING_TRUST (suspicious)', async () => {
    const record = await getAffinityRecord('russian', 'handler')
    expect(record.trust).toBe(STARTING_TRUST)
    expect(tierForTrust(record.trust).id).toBe('suspicious')
  })

  it('caps gains at DAILY_TRUST_CAP per calendar day', async () => {
    await addTrust('russian', 'handler', 2, DAY1)
    await addTrust('russian', 'handler', 2, DAY1)
    const { record } = await addTrust('russian', 'handler', 10, DAY1)
    expect(record.trust).toBe(STARTING_TRUST + DAILY_TRUST_CAP)
  })

  it('resets the daily cap on a new calendar day', async () => {
    await addTrust('russian', 'handler', DAILY_TRUST_CAP, DAY1)
    const { record } = await addTrust('russian', 'handler', DAILY_TRUST_CAP, DAY2)
    expect(record.trust).toBe(STARTING_TRUST + DAILY_TRUST_CAP * 2)
  })

  it('never caps a negative (rival-faction penalty) change', async () => {
    const { record } = await addTrust('russian', 'handler', -50, DAY1)
    expect(record.trust).toBe(Math.max(0, STARTING_TRUST - 50))
  })

  it('reports tierChanged and justBecameAlly only when the tier actually crosses a boundary', async () => {
    const noChange = await addTrust('russian', 'handler', 1, DAY1)
    expect(noChange.tierChanged).toBe(false)
    expect(noChange.justBecameAlly).toBe(false)

    // Push straight to Ally across several days to avoid the daily cap.
    let last
    for (let day = 18; day <= 30; day++) {
      const now = new Date(`2026-07-${day}T12:00:00Z`)
      last = await addTrust('russian', 'handler', DAILY_TRUST_CAP, now)
      if (last.record.trust >= 75) break
    }
    expect(last.record.trust).toBeGreaterThanOrEqual(75)
    expect(last.justBecameAlly).toBe(true)
  })

  it('clamps trust within [0, 100]', async () => {
    const { record: low } = await addTrust('french', 'aristocrate', -1000, DAY1)
    expect(low.trust).toBe(0)
  })
})

describe('markAllyRewardClaimed', () => {
  it('persists the claimed flag', async () => {
    await markAllyRewardClaimed('spanish', 'miliciana')
    const record = await getAffinityRecord('spanish', 'miliciana')
    expect(record.allyRewardClaimed).toBe(true)
  })
})

describe('TRUST_TIERS', () => {
  it('is ordered lowest to highest with no gaps', () => {
    for (let i = 1; i < TRUST_TIERS.length; i++) {
      expect(TRUST_TIERS[i].min).toBeGreaterThan(TRUST_TIERS[i - 1].min)
    }
  })
})

describe('applyFactionTrustEvent', () => {
  it('gives the aligned persona trust and the rival persona a penalty', async () => {
    const results = await applyFactionTrustEvent('russian', ['nomenklatura'])
    expect(results.length).toBeGreaterThan(0)
    const handler = await getAffinityRecord('russian', 'handler')
    const defector = await getAffinityRecord('russian', 'defector')
    expect(handler.trust).toBe(STARTING_TRUST + 2)
    expect(defector.trust).toBe(STARTING_TRUST - 1)
  })

  it('is a no-op when no faction matched', async () => {
    const results = await applyFactionTrustEvent('russian', [])
    expect(results).toEqual([])
  })
})
