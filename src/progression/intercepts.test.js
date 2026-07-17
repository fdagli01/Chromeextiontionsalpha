import { describe, expect, it } from 'vitest'
import { getPersonaById } from './mentors.js'
import { INTERCEPTS, resolveIntercept, rollIntercept } from './intercepts.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']

describe('INTERCEPTS', () => {
  it('defines an encounter for every theme, tied to a real persona, embedding the term', () => {
    for (const themeId of THEME_IDS) {
      const def = INTERCEPTS[themeId]
      expect(def, themeId).toBeDefined()
      expect(getPersonaById(themeId, def.personaId), `${themeId}:${def.personaId}`).toBeDefined()
      expect(def.plea('WORD')).toContain('WORD')
      expect(def.title.length).toBeGreaterThan(0)
    }
  })

  it('gives Spanish a timer and French the moral inversion, per the design', () => {
    expect(INTERCEPTS.spanish.timerSec).toBe(10)
    expect(INTERCEPTS.french.moralInversion).toBe(true)
    expect(INTERCEPTS.portuguese.shipShake).toBe(true)
  })
})

describe('rollIntercept', () => {
  it('fires below the chance threshold and not above it', () => {
    expect(rollIntercept('russian', () => 0.01)).toBe(INTERCEPTS.russian)
    expect(rollIntercept('russian', () => 0.99)).toBeNull()
    expect(rollIntercept('klingon', () => 0)).toBeNull()
  })
})

describe('resolveIntercept', () => {
  it('rewards the persona on a correct answer for a normal encounter', () => {
    const outcome = resolveIntercept(INTERCEPTS.russian, true)
    expect(outcome.personaHelped).toBe(true)
    expect(outcome.trustDelta).toBeGreaterThan(0)
    expect(outcome.bonusXp).toBeGreaterThan(0)
    expect(outcome.creditPersonaId).toBe('defector')
  })

  it('penalizes trust slightly on a miss for a normal encounter', () => {
    const outcome = resolveIntercept(INTERCEPTS.italian, false)
    expect(outcome.personaHelped).toBe(false)
    expect(outcome.trustDelta).toBeLessThan(0)
    expect(outcome.bonusXp).toBe(0)
  })

  it('inverts the French encounter: a deliberate miss pleases the aristocrat', () => {
    const bribe = resolveIntercept(INTERCEPTS.french, false)
    expect(bribe.personaHelped).toBe(true)
    expect(bribe.creditPersonaId).toBe('aristocrate')
    expect(bribe.trustDelta).toBe(3)
    expect(bribe.bonusXp).toBeGreaterThan(0)

    const refusal = resolveIntercept(INTERCEPTS.french, true)
    expect(refusal.creditPersonaId).toBe('tribunal')
    expect(refusal.trustDelta).toBeGreaterThan(0)
  })
})
