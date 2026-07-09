import { describe, expect, it } from 'vitest'
import {
  computeStreak,
  levelForXp,
  levelProgress,
  rankForLevel,
  streakTier,
  xpForQuality,
  xpRequiredForLevel,
} from './xp.js'
import { QUALITY } from '../sm2/sm2.js'

describe('xpForQuality', () => {
  it('awards no XP for a failed recall', () => {
    expect(xpForQuality(QUALITY.AGAIN)).toBe(0)
  })

  it('awards increasing XP for harder-to-easier successful recalls', () => {
    expect(xpForQuality(QUALITY.HARD)).toBeLessThan(xpForQuality(QUALITY.GOOD))
    expect(xpForQuality(QUALITY.GOOD)).toBeLessThan(xpForQuality(QUALITY.EASY))
  })
})

describe('levelForXp / xpRequiredForLevel', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(levelForXp(0)).toBe(1)
  })

  it('reaches level 2 exactly at the level-1 threshold', () => {
    const threshold = xpRequiredForLevel(2)
    expect(levelForXp(threshold - 1)).toBe(1)
    expect(levelForXp(threshold)).toBe(2)
  })

  it('requires progressively more XP for each subsequent level', () => {
    const gap1 = xpRequiredForLevel(2) - xpRequiredForLevel(1)
    const gap2 = xpRequiredForLevel(3) - xpRequiredForLevel(2)
    expect(gap2).toBeGreaterThan(gap1)
  })
})

describe('levelProgress', () => {
  it('reports progress within the current level', () => {
    const threshold2 = xpRequiredForLevel(2)
    const progress = levelProgress(threshold2 + 30)
    expect(progress.level).toBe(2)
    expect(progress.xpIntoLevel).toBe(30)
    expect(progress.xpToNextLevel).toBe(xpRequiredForLevel(3) - threshold2)
  })
})

describe('rankForLevel', () => {
  const ranks = ['Acemi', 'Çavuş', 'General']

  it('returns the rank matching the level', () => {
    expect(rankForLevel(ranks, 2)).toBe('Çavuş')
  })

  it('clamps to the last rank beyond the list length', () => {
    expect(rankForLevel(ranks, 99)).toBe('General')
  })

  it('falls back to a generic label when no ranks are defined', () => {
    expect(rankForLevel([], 4)).toBe('Seviye 4')
  })
})

describe('computeStreak', () => {
  it('starts a new streak at 1 for a first-ever activity', () => {
    expect(computeStreak(null, '2026-07-09', 0)).toBe(1)
  })

  it('is a no-op when already active today', () => {
    expect(computeStreak('2026-07-09', '2026-07-09', 5)).toBe(5)
  })

  it('increments the streak for consecutive days', () => {
    expect(computeStreak('2026-07-08', '2026-07-09', 5)).toBe(6)
  })

  it('resets the streak after a gap', () => {
    expect(computeStreak('2026-07-01', '2026-07-09', 5)).toBe(1)
  })
})

describe('streakTier', () => {
  it('grows through tiers as the streak lengthens', () => {
    expect(streakTier(0)).toBe(0)
    expect(streakTier(2)).toBe(0)
    expect(streakTier(3)).toBe(1)
    expect(streakTier(6)).toBe(1)
    expect(streakTier(7)).toBe(2)
    expect(streakTier(13)).toBe(2)
    expect(streakTier(14)).toBe(3)
    expect(streakTier(100)).toBe(3)
  })
})
