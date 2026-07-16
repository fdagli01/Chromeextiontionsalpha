import { describe, expect, it } from 'vitest'
import { allObjectivesComplete, computeDailyObjectives } from './briefing.js'

const base = {
  dailyQuestDate: '2026-07-16',
  dailyReviewCount: 0,
  dailyBestCombo: 0,
  dailyXp: 0,
}

describe('computeDailyObjectives', () => {
  it('reports zero progress on a fresh day', () => {
    const objectives = computeDailyObjectives(base, '2026-07-16')
    expect(objectives.map((o) => o.current)).toEqual([0, 0, 0])
    expect(objectives.every((o) => !o.done)).toBe(true)
  })

  it('reflects tracked progress and clamps to targets', () => {
    const progress = { ...base, dailyReviewCount: 7, dailyBestCombo: 6, dailyXp: 40 }
    const [reviews, combo, xp] = computeDailyObjectives(progress, '2026-07-16')
    expect(reviews.current).toBe(5)
    expect(reviews.done).toBe(true)
    expect(combo.done).toBe(true)
    expect(xp.current).toBe(40)
    expect(xp.done).toBe(false)
  })

  it('treats a stale quest day as an empty briefing', () => {
    const progress = { ...base, dailyReviewCount: 9, dailyBestCombo: 9, dailyXp: 200 }
    const objectives = computeDailyObjectives(progress, '2026-07-17')
    expect(objectives.every((o) => o.current === 0 && !o.done)).toBe(true)
  })
})

describe('allObjectivesComplete', () => {
  it('is true only when every objective is done', () => {
    const progress = { ...base, dailyReviewCount: 5, dailyBestCombo: 5, dailyXp: 100 }
    expect(allObjectivesComplete(computeDailyObjectives(progress, '2026-07-16'))).toBe(true)
    expect(allObjectivesComplete(computeDailyObjectives(base, '2026-07-16'))).toBe(false)
  })
})
