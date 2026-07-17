import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getWordsByTheme } from '../db/wordsRepo.js'
import { getMentor } from './mentors.js'
import { ALLY_PACKS, grantAllyPack } from './allyPacks.js'

const THEME_IDS = ['russian', 'italian', 'portuguese', 'french', 'spanish']
const MOMENTS = ['levelUp', 'streakUp', 'comboMilestone', 'miss']

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('ALLY_PACKS', () => {
  it('has a 3-word pack for every persona in every theme', () => {
    for (const themeId of THEME_IDS) {
      const personaIds = new Set(MOMENTS.map((moment) => getMentor(themeId, moment).id))
      for (const personaId of personaIds) {
        const pack = ALLY_PACKS[`${themeId}:${personaId}`]
        expect(pack, `${themeId}:${personaId}`).toBeDefined()
        expect(pack).toHaveLength(3)
        for (const word of pack) {
          expect(word.term.length).toBeGreaterThan(0)
          expect(word.translation.length).toBeGreaterThan(0)
          expect(word.fact.length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('grantAllyPack', () => {
  it('adds all three words on first grant', async () => {
    const result = await grantAllyPack('russian', 'handler')
    expect(result).toEqual({ total: 3, added: 3 })
    const words = await getWordsByTheme('russian')
    expect(words).toHaveLength(3)
  })

  it('skips words already present, and is a no-op for an unknown persona', async () => {
    await grantAllyPack('russian', 'handler')
    const second = await grantAllyPack('russian', 'handler')
    expect(second).toEqual({ total: 3, added: 0 })

    expect(await grantAllyPack('russian', 'nonexistent')).toEqual({ total: 0, added: 0 })
  })
})
