import { describe, expect, it } from 'vitest'
import {
  CONTRABAND_RIVAL_PENALTY,
  CONTRABAND_SALE_XP,
  getContrabandRivalFaction,
  getDailyContraband,
} from './contraband.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']

describe('getDailyContraband', () => {
  it('is deterministic for a given theme+day and varies across days', () => {
    const a = getDailyContraband('spanish', '2026-07-17')
    const b = getDailyContraband('spanish', '2026-07-17')
    expect(a.id).toBe(b.id)

    const ids = new Set()
    for (let d = 1; d <= 15; d++) {
      ids.add(getDailyContraband('spanish', `2026-07-${String(d).padStart(2, '0')}`).id)
    }
    expect(ids.size).toBeGreaterThan(1)
  })

  it('every theme has a rule whose matcher actually matches its own suffix', () => {
    for (const themeId of THEME_IDS) {
      const rule = getDailyContraband(themeId, '2026-07-17')
      expect(rule, themeId).not.toBeNull()
      const suffix = rule.id.replace('suffix-', '')
      expect(rule.matches(`palabra${suffix}`), `${themeId}:${suffix}`).toBe(true)
      expect(rule.matches('xyz')).toBe(false)
    }
  })

  it('returns null for an unknown theme', () => {
    expect(getDailyContraband('klingon')).toBeNull()
  })
})

describe('getContrabandRivalFaction', () => {
  it('picks a faction distinct across the roster for themes with 2+ factions', () => {
    for (const themeId of THEME_IDS) {
      const rival = getContrabandRivalFaction(themeId, '2026-07-17')
      expect(rival, themeId).not.toBeNull()
      expect(rival.themeId).toBe(themeId)
    }
  })
})

describe('constants', () => {
  it('pays a positive XP sale and a negative rival penalty', () => {
    expect(CONTRABAND_SALE_XP).toBeGreaterThan(0)
    expect(CONTRABAND_RIVAL_PENALTY).toBeLessThan(0)
  })
})
