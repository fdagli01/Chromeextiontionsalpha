import { describe, expect, it } from 'vitest'
import { getBountyMentor, getMentor, getPersonaById, pickBountyLine, pickMentorLine } from './mentors.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']
const MOMENTS = ['levelUp', 'streakUp', 'comboMilestone', 'miss', 'sessionComplete']

describe('getMentor', () => {
  it('defines a persona with lines and a backstory for every theme+moment', () => {
    for (const id of THEME_IDS) {
      for (const moment of MOMENTS) {
        const persona = getMentor(id, moment)
        expect(persona).toBeDefined()
        expect(persona.name.length).toBeGreaterThan(0)
        expect(persona.backstory.length).toBeGreaterThan(0)
        expect(persona.lines.length).toBeGreaterThan(0)
      }
    }
  })

  it('returns undefined for an unknown theme or moment', () => {
    expect(getMentor('klingon', 'levelUp')).toBeUndefined()
    expect(getMentor('russian', 'nonsense')).toBeUndefined()
  })
})

describe('pickMentorLine', () => {
  it('deterministically picks by the random function', () => {
    expect(pickMentorLine('russian', 'levelUp', () => 0)).toBe(getMentor('russian', 'levelUp').lines[0])
  })

  it('returns null for an unknown theme or moment', () => {
    expect(pickMentorLine('klingon', 'levelUp')).toBeNull()
  })
})

describe('bounty mentor', () => {
  it('every theme has bounty completion lines on its comboMilestone persona', () => {
    for (const id of THEME_IDS) {
      const mentor = getBountyMentor(id)
      expect(mentor).toBeDefined()
      expect(mentor.bountyLines.length).toBeGreaterThan(0)
    }
  })

  it('pickBountyLine deterministically picks by the random function', () => {
    expect(pickBountyLine('russian', () => 0)).toBe(getBountyMentor('russian').bountyLines[0])
  })

  it('returns null for an unknown theme', () => {
    expect(pickBountyLine('klingon')).toBeNull()
  })
})

describe('getPersonaById', () => {
  it('finds a persona by id regardless of which moment it was fetched from', () => {
    const viaMoment = getMentor('russian', 'levelUp')
    const viaId = getPersonaById('russian', viaMoment.id)
    expect(viaId).toEqual(viaMoment)
  })

  it('returns undefined for an unknown persona id', () => {
    expect(getPersonaById('russian', 'nonexistent')).toBeUndefined()
  })
})
