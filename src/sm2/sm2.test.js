import { describe, expect, it } from 'vitest'
import { gradeReview, initialSchedulingState, QUALITY } from './sm2.js'

const NOW = new Date('2026-07-09T12:00:00.000Z')

describe('gradeReview', () => {
  it('schedules a brand-new word 1 day out on the first GOOD review', () => {
    const result = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    expect(result.repetition).toBe(1)
    expect(result.interval).toBe(1)
    expect(result.dueDate).toBe('2026-07-10T12:00:00.000Z')
  })

  it('schedules the second consecutive success 6 days out', () => {
    const afterFirst = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const afterSecond = gradeReview(afterFirst, QUALITY.GOOD, NOW)
    expect(afterSecond.repetition).toBe(2)
    expect(afterSecond.interval).toBe(6)
  })

  it('multiplies interval by ease factor from the third success onward', () => {
    const afterSecond = gradeReview(gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW), QUALITY.GOOD, NOW)
    const afterThird = gradeReview(afterSecond, QUALITY.GOOD, NOW)

    expect(afterThird.repetition).toBe(3)
    expect(afterThird.interval).toBe(Math.round(afterSecond.interval * afterSecond.easeFactor))
  })

  it('resets repetition and makes the word immediately due again on AGAIN', () => {
    let state = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    state = gradeReview(state, QUALITY.GOOD, NOW)
    expect(state.repetition).toBe(2)

    const failed = gradeReview(state, QUALITY.AGAIN, NOW)
    expect(failed.repetition).toBe(0)
    expect(failed.interval).toBe(0)
    expect(failed.dueDate).toBe(NOW.toISOString())
  })

  it('never drops the ease factor below 1.3', () => {
    let state = initialSchedulingState()
    for (let i = 0; i < 20; i++) {
      state = gradeReview(state, QUALITY.AGAIN, NOW)
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('increases the ease factor faster for EASY than GOOD', () => {
    const good = gradeReview(initialSchedulingState(), QUALITY.GOOD, NOW)
    const easy = gradeReview(initialSchedulingState(), QUALITY.EASY, NOW)
    expect(easy.easeFactor).toBeGreaterThan(good.easeFactor)
  })

  it('rejects out-of-range quality values', () => {
    expect(() => gradeReview(initialSchedulingState(), 6, NOW)).toThrow()
    expect(() => gradeReview(initialSchedulingState(), -1, NOW)).toThrow()
  })
})
