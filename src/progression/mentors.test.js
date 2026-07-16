import { describe, expect, it } from 'vitest'
import { getMentor, MENTORS, pickMentorLine } from './mentors.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']
const MOMENTS = ['levelUp', 'streakUp', 'comboMilestone', 'miss', 'sessionComplete']

describe('MENTORS', () => {
  it('defines a mentor with every moment populated for each theme', () => {
    for (const id of THEME_IDS) {
      const mentor = getMentor(id)
      expect(mentor).toBeDefined()
      expect(mentor.name.length).toBeGreaterThan(0)
      for (const moment of MOMENTS) {
        expect(mentor.lines[moment].length).toBeGreaterThan(0)
      }
    }
  })
})

describe('pickMentorLine', () => {
  it('deterministically picks by the random function', () => {
    expect(pickMentorLine('russian', 'levelUp', () => 0)).toBe(MENTORS.russian.lines.levelUp[0])
  })

  it('returns null for an unknown theme or moment', () => {
    expect(pickMentorLine('klingon', 'levelUp')).toBeNull()
  })
})
