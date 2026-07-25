import { describe, expect, it } from 'vitest'
import { DOUBLE_AGENT_BONUS_XP, FALSE_FRIENDS, findFalseFriend } from './falseFriends.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']

describe('FALSE_FRIENDS', () => {
  it('gives every theme a substantial roster with distinct trap/truth pairs', () => {
    for (const themeId of THEME_IDS) {
      const list = FALSE_FRIENDS[themeId]
      expect(list.length, themeId).toBeGreaterThanOrEqual(10)
      for (const entry of list) {
        expect(entry.term.length, themeId).toBeGreaterThan(0)
        expect(entry.trap.toLowerCase()).not.toBe(entry.truth.toLowerCase())
        expect(entry.note.length).toBeGreaterThan(0)
      }
    }
  })

  it('has no duplicate terms within a theme', () => {
    for (const themeId of THEME_IDS) {
      const terms = FALSE_FRIENDS[themeId].map((f) => f.term.toLowerCase())
      expect(new Set(terms).size).toBe(terms.length)
    }
  })
})

describe('findFalseFriend', () => {
  it('finds a known term case-insensitively', () => {
    const found = findFalseFriend('spanish', 'EMBARAZADA')
    expect(found).toBeDefined()
    expect(found.truth).toBe('pregnant')
    expect(found.trap).toBe('embarrassed')
  })

  it('returns null for an unknown term or theme', () => {
    expect(findFalseFriend('spanish', 'gato')).toBeNull()
    expect(findFalseFriend('klingon', 'embarazada')).toBeNull()
    expect(findFalseFriend('spanish', '')).toBeNull()
  })
})

describe('DOUBLE_AGENT_BONUS_XP', () => {
  it('is a positive flat bonus', () => {
    expect(DOUBLE_AGENT_BONUS_XP).toBeGreaterThan(0)
  })
})
