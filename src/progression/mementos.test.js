import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { addTrust } from './affinity.js'
import { getMentor, getPersonaById } from './mentors.js'
import { getDeskMementos, MEMENTOS, MEMENTO_TRUST_THRESHOLD } from './mementos.js'
import { getDailyDirective } from './directives.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']
const MOMENTS = ['levelUp', 'streakUp', 'comboMilestone', 'miss']

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('MEMENTOS', () => {
  it('defines a memento for every persona in every theme', () => {
    for (const themeId of THEME_IDS) {
      const personaIds = new Set(MOMENTS.map((m) => getMentor(themeId, m).id))
      for (const personaId of personaIds) {
        const memento = MEMENTOS[`${themeId}:${personaId}`]
        expect(memento, `${themeId}:${personaId}`).toBeDefined()
        expect(memento.icon.length).toBeGreaterThan(0)
        expect(memento.flavor.length).toBeGreaterThan(0)
        expect(getPersonaById(themeId, personaId)).toBeDefined()
      }
    }
  })
})

describe('getDeskMementos', () => {
  it('is empty below the Warm threshold and appears once trust crosses it', async () => {
    expect(await getDeskMementos('russian')).toEqual([])

    // Push one persona to Warm across days (daily cap is 6).
    for (let day = 10; day <= 20; day++) {
      await addTrust('russian', 'handler', 6, new Date(`2026-08-${day}T12:00:00Z`))
    }
    const mementos = await getDeskMementos('russian')
    expect(mementos).toHaveLength(1)
    expect(mementos[0].personaId).toBe('handler')
    expect(mementos[0].personaName).toBe('THE HANDLER')
    expect(mementos[0].icon).toBe(MEMENTOS['russian:handler'].icon)
  })

  it('threshold constant matches the Warm tier boundary', () => {
    expect(MEMENTO_TRUST_THRESHOLD).toBe(50)
  })
})

describe('getDailyDirective', () => {
  it('is deterministic for a given theme+day and differs across days', () => {
    const a = getDailyDirective('russian', '2026-07-17')
    const b = getDailyDirective('russian', '2026-07-17')
    expect(a).toEqual(b)

    const results = new Set()
    for (let d = 10; d < 20; d++) {
      results.add(getDailyDirective('russian', `2026-07-${d}`) === null ? 'off' : 'on')
    }
    expect(results.has('on')).toBe(true)
    expect(results.has('off')).toBe(true)
  })

  it('every theme has a directive with a real effect id', () => {
    for (const themeId of THEME_IDS) {
      // Find a day it's active.
      let def = null
      for (let d = 1; d <= 20 && !def; d++) {
        def = getDailyDirective(themeId, `2026-09-${String(d).padStart(2, '0')}`)
      }
      expect(def, themeId).not.toBeNull()
      expect(['hardXp2', 'noTension', 'doubleMissTension', 'doubleReputation', 'fastXp']).toContain(def.effect)
    }
  })
})
