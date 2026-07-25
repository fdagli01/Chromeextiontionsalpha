import { describe, expect, it } from 'vitest'
import { BADGE_DEFS, evaluateBadges, resolveBadges } from './badges.js'

describe('BADGE_DEFS', () => {
  it('uses unique ids and gives every badge an icon and a name', () => {
    const ids = BADGE_DEFS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const badge of BADGE_DEFS) {
      expect(badge.icon.length).toBeGreaterThan(0)
      expect(badge.name.length).toBeGreaterThan(0)
      expect(badge.check).toBeTypeOf('function')
    }
  })

  it('survives a progress object missing the newer counters', () => {
    // Older saves predate doubleAgentsExposed; a badge check must not throw.
    for (const badge of BADGE_DEFS) {
      expect(() => badge.check({ streak: 0, level: 1, xp: 0 })).not.toThrow()
    }
  })
})

describe('evaluateBadges', () => {
  it('awards nothing to a brand-new player', () => {
    const { badges, newlyEarned } = evaluateBadges({ streak: 0, level: 1, xp: 0, badges: [] })
    expect(badges).toEqual([])
    expect(newlyEarned).toEqual([])
  })

  it('awards every threshold crossed at once, newest only', () => {
    const { badges, newlyEarned } = evaluateBadges({ streak: 7, level: 1, xp: 0, badges: [] })
    const ids = newlyEarned.map((b) => b.id)
    expect(ids).toContain('streak-3')
    expect(ids).toContain('streak-5')
    expect(ids).toContain('streak-7')
    expect(ids).not.toContain('streak-14')
    expect(badges).toEqual(ids)
  })

  it('never re-awards a badge already held', () => {
    const first = evaluateBadges({ streak: 3, level: 1, xp: 0, badges: [] })
    expect(first.newlyEarned.map((b) => b.id)).toEqual(['streak-3'])
    const second = evaluateBadges({ streak: 3, level: 1, xp: 0, badges: first.badges })
    expect(second.newlyEarned).toEqual([])
    expect(second.badges).toEqual(first.badges)
  })

  it('awards the counterintelligence badges from the double-agent counter', () => {
    const { newlyEarned } = evaluateBadges({ streak: 0, level: 1, xp: 0, badges: [], doubleAgentsExposed: 5 })
    const ids = newlyEarned.map((b) => b.id)
    expect(ids).toContain('agent-1')
    expect(ids).toContain('agent-5')
    expect(ids).not.toContain('agent-10')
  })

  it('treats a missing badges array as empty rather than throwing', () => {
    expect(() => evaluateBadges({ streak: 5, level: 1, xp: 0 })).not.toThrow()
  })
})

describe('resolveBadges', () => {
  it('maps ids back to definitions and drops unknown ones', () => {
    const resolved = resolveBadges(['streak-3', 'not-a-badge'])
    expect(resolved).toHaveLength(1)
    expect(resolved[0].id).toBe('streak-3')
  })

  it('handles null/undefined input', () => {
    expect(resolveBadges(null)).toEqual([])
    expect(resolveBadges(undefined)).toEqual([])
  })
})
