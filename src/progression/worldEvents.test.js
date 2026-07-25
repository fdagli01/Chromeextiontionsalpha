import { describe, expect, it } from 'vitest'
import { getActiveWorldEvent, worldEventMultiplier } from './worldEvents.js'

describe('getActiveWorldEvent', () => {
  it('runs Double Dispatch on weekends', () => {
    // 2026-07-18 is a Saturday, 2026-07-19 a Sunday.
    expect(getActiveWorldEvent(new Date('2026-07-18T12:00:00')).id).toBe('double-dispatch')
    expect(getActiveWorldEvent(new Date('2026-07-19T12:00:00')).xpMultiplier).toBe(2)
  })

  it('runs Founding Day on the first of a month (weekday)', () => {
    // 2026-09-01 is a Tuesday.
    const event = getActiveWorldEvent(new Date('2026-09-01T12:00:00'))
    expect(event.id).toBe('founding-day')
    expect(event.xpMultiplier).toBe(1.5)
  })

  it('prefers the weekend event when the 1st falls on a weekend', () => {
    // 2026-08-01 is a Saturday.
    expect(getActiveWorldEvent(new Date('2026-08-01T12:00:00')).id).toBe('double-dispatch')
  })

  it('returns null on an ordinary weekday', () => {
    // 2026-07-16 is a Thursday.
    expect(getActiveWorldEvent(new Date('2026-07-16T12:00:00'))).toBeNull()
  })
})

describe('worldEventMultiplier', () => {
  it('is 1 when there is no event', () => {
    expect(worldEventMultiplier(null)).toBe(1)
  })

  it('reads the event multiplier', () => {
    expect(worldEventMultiplier({ xpMultiplier: 2 })).toBe(2)
  })
})
