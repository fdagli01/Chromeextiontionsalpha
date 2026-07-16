import { describe, expect, it } from 'vitest'
import { INTERCEPT_CHANCE, rollInterceptEvent } from './randomEvents.js'

describe('rollInterceptEvent', () => {
  it('returns null when the roll misses the chance window', () => {
    expect(rollInterceptEvent(() => INTERCEPT_CHANCE)).toBeNull()
    expect(rollInterceptEvent(() => 0.99)).toBeNull()
  })

  it('returns an event when the first roll lands in the chance window', () => {
    // First call selects whether the event fires; second picks which one.
    const rolls = [0.01, 0]
    let i = 0
    const event = rollInterceptEvent(() => rolls[i++])
    expect(event).not.toBeNull()
    expect(event.bonusXp).toBeGreaterThan(0)
    expect(typeof event.label).toBe('string')
  })

  it('picks different events based on the selector roll', () => {
    // [fire roll, selector roll]: selector 0 -> first event, ~0.99 -> last.
    const firstSeq = [0.01, 0]
    let i = 0
    const first = rollInterceptEvent(() => firstSeq[i++])

    const lastSeq = [0.01, 0.99]
    let j = 0
    const last = rollInterceptEvent(() => lastSeq[j++])

    expect(first.icon).toBe('📡')
    expect(last.icon).toBe('📨')
    expect(first.icon).not.toBe(last.icon)
  })
})
