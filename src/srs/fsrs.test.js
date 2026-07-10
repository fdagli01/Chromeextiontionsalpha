import { describe, expect, it } from 'vitest'
import { bootstrapFromSm2, gradeReview, initialSchedulingState, QUALITY } from './fsrs.js'

const NOW = new Date('2026-07-09T12:00:00.000Z')

describe('gradeReview', () => {
  it('gives a brand-new word a positive stability and interval on the first GOOD review', () => {
    const result = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    expect(result.stability).toBeGreaterThan(0)
    expect(result.difficulty).toBeGreaterThanOrEqual(1)
    expect(result.difficulty).toBeLessThanOrEqual(10)
    expect(result.interval).toBeGreaterThanOrEqual(1)
    expect(result.dueDate).not.toBe(NOW.toISOString())
  })

  it('grows stability further on a second successful review than stopping after one', () => {
    const first = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const later = new Date(NOW.getTime() + first.interval * 24 * 60 * 60 * 1000)
    const second = gradeReview(first, QUALITY.GOOD, later)
    expect(second.stability).toBeGreaterThan(first.stability)
  })

  it('makes a failed recall immediately due again', () => {
    const first = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const later = new Date(NOW.getTime() + first.interval * 24 * 60 * 60 * 1000)
    const failed = gradeReview(first, QUALITY.AGAIN, later)
    expect(failed.interval).toBe(0)
    expect(failed.dueDate).toBe(later.toISOString())
    expect(failed.stability).toBeGreaterThan(0)
  })

  it('keeps difficulty within the 1-10 range even after many failures', () => {
    let state = initialSchedulingState()
    let at = NOW
    for (let i = 0; i < 20; i++) {
      state = gradeReview(state, QUALITY.AGAIN, at)
      at = new Date(at.getTime() + 24 * 60 * 60 * 1000)
    }
    expect(state.difficulty).toBeGreaterThanOrEqual(1)
    expect(state.difficulty).toBeLessThanOrEqual(10)
  })

  it('grows stability more from an EASY review than a GOOD review', () => {
    const good = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const easy = gradeReview(initialSchedulingState(), QUALITY.EASY, NOW)
    expect(easy.stability).toBeGreaterThan(good.stability)
  })

  it('grows stability less from a HARD review than a GOOD review', () => {
    const good = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const hard = gradeReview(initialSchedulingState(), QUALITY.HARD, NOW)
    expect(hard.stability).toBeLessThan(good.stability)
  })

  it('rejects out-of-range quality values', () => {
    expect(() => gradeReview(initialSchedulingState(), 5, NOW)).toThrow()
    expect(() => gradeReview(initialSchedulingState(), 0, NOW)).toThrow()
  })
})

describe('bootstrapFromSm2', () => {
  it('returns a fresh state for a word with no prior SM-2 progress', () => {
    const state = bootstrapFromSm2({ interval: 0, easeFactor: 2.5, lastReviewedAt: null })
    expect(state.stability).toBeUndefined()
    expect(state.difficulty).toBeUndefined()
  })

  it('carries a positive interval and ease factor into a comparable stability/difficulty', () => {
    const state = bootstrapFromSm2({ interval: 12, easeFactor: 2.2, lastReviewedAt: NOW.toISOString() })
    expect(state.stability).toBe(12)
    expect(state.difficulty).toBeGreaterThanOrEqual(1)
    expect(state.difficulty).toBeLessThanOrEqual(10)
  })

  it('gives an easier (lower easeFactor-implied difficulty) word a lower difficulty score', () => {
    const hard = bootstrapFromSm2({ interval: 6, easeFactor: 1.3, lastReviewedAt: NOW.toISOString() })
    const easy = bootstrapFromSm2({ interval: 6, easeFactor: 3.0, lastReviewedAt: NOW.toISOString() })
    expect(easy.difficulty).toBeLessThan(hard.difficulty)
  })
})
