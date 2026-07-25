import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getProgress } from '../db/progressRepo.js'
import { getFactionProgress } from '../db/factionsRepo.js'
import { getPersonaById } from './mentors.js'
import { addTrust } from './affinity.js'
import { getDecision, recordDecision } from './decisions.js'
import { addWord, reviewWord } from '../db/wordsRepo.js'
import { QUALITY } from '../srs/fsrs.js'
import {
  DECISION_CALLOUTS,
  STORY_SCENES,
  getPendingScene,
  isTermKnown,
  pickDecisionCallout,
  resolveSceneChoice,
} from './storyScenes.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

/** Pushes a persona's trust up across simulated days (daily cap is 6). */
async function pushTrust(themeId, personaId, target) {
  for (let day = 1; day <= 30; day++) {
    const { record } = await addTrust(themeId, personaId, 6, new Date(`2026-09-${String(day).padStart(2, '0')}T12:00:00Z`))
    if (record.trust >= target) return record
  }
  throw new Error('trust target not reached')
}

describe('STORY_SCENES', () => {
  it('every scene references a real persona and offers 2-3 meaningful choices', () => {
    for (const [themeId, scenes] of Object.entries(STORY_SCENES)) {
      for (const scene of scenes) {
        expect(getPersonaById(themeId, scene.personaId), scene.id).toBeDefined()
        expect(['warm', 'ally']).toContain(scene.tier)
        expect(scene.body.length).toBeGreaterThan(50)
        expect(scene.choices.length).toBeGreaterThanOrEqual(2)
        expect(scene.choices.length).toBeLessThanOrEqual(4)
        for (const choice of scene.choices) {
          expect(choice.label.length).toBeGreaterThan(0)
          expect(choice.response.length).toBeGreaterThan(20)
        }
        // Any choice beyond the second pair is a word gate — the SRS-RPG fusion.
        if (scene.choices.length > 2) {
          expect(scene.choices.some((c) => c.requiresTerm)).toBe(true)
        }
      }
    }
  })

  it('gives every theme a full warm+ally chain for all four personas', () => {
    for (const themeId of ['russian', 'french', 'italian', 'portuguese', 'spanish']) {
      const scenes = STORY_SCENES[themeId]
      expect(scenes, themeId).toHaveLength(8)
      const personas = new Set(scenes.map((s) => s.personaId))
      expect(personas.size).toBe(4)
    }
  })

  it('every word-gated choice pays at least as well as its ungated siblings', () => {
    for (const scenes of Object.values(STORY_SCENES)) {
      for (const scene of scenes) {
        const gated = scene.choices.find((c) => c.requiresTerm)
        if (!gated) continue
        const maxUngatedXp = Math.max(...scene.choices.filter((c) => !c.requiresTerm).map((c) => c.effects?.xp ?? 0))
        expect(gated.effects?.xp ?? 0, scene.id).toBeGreaterThanOrEqual(maxUngatedXp)
      }
    }
  })
})

describe('getPendingScene', () => {
  it('is null before any trust exists, then surfaces the warm scene at Warm', async () => {
    expect(await getPendingScene('russian')).toBeNull()
    await pushTrust('russian', 'handler', 50)
    const scene = await getPendingScene('russian')
    expect(scene?.id).toBe('ru-handler-warm')
  })

  it('does not resurface a scene once its choice is journaled, and unlocks ally later', async () => {
    await pushTrust('russian', 'handler', 50)
    const warm = await getPendingScene('russian')
    await resolveSceneChoice('russian', warm, warm.choices[0])
    expect(await getPendingScene('russian')).toBeNull()

    await pushTrust('russian', 'handler', 75)
    const ally = await getPendingScene('russian')
    expect(ally?.id).toBe('ru-handler-ally')
  })
})

describe('resolveSceneChoice', () => {
  it('journals the choice and applies reputation and XP effects', async () => {
    await pushTrust('french', 'tribunal', 50)
    const scene = await getPendingScene('french')
    expect(scene.id).toBe('fr-tribunal-warm')
    const refuse = scene.choices.find((c) => c.id === 'refuse')
    const outcome = await resolveSceneChoice('french', scene, refuse)
    expect(outcome.response.length).toBeGreaterThan(0)

    const decision = await getDecision('french', 'scene:fr-tribunal-warm')
    expect(decision.choiceId).toBe('refuse')
    const rep = await getFactionProgress('jacobins', 'french')
    expect(rep.reputation).toBe(15)
  })

  it('never overwrites the first recorded choice', async () => {
    await pushTrust('french', 'tribunal', 50)
    const scene = await getPendingScene('french')
    await resolveSceneChoice('french', scene, scene.choices[0])
    await recordDecision('french', `scene:${scene.id}`, 'something-else')
    const decision = await getDecision('french', `scene:${scene.id}`)
    expect(decision.choiceId).toBe(scene.choices[0].id)
  })
})

describe('pickDecisionCallout', () => {
  it('only speaks lines matching a journaled decision by the right persona', () => {
    const decisions = [{ id: 'french-bribe', choiceId: 'accepted' }]
    expect(pickDecisionCallout('french', decisions, 'tribunal', () => 0)).toContain('Gold buys ink')
    expect(pickDecisionCallout('french', decisions, 'aristocrate', () => 0)).toBeNull()
    expect(pickDecisionCallout('french', [], 'tribunal', () => 0)).toBeNull()
  })

  it('every callout references a real persona and a plausible decision id', () => {
    for (const callout of DECISION_CALLOUTS) {
      expect(getPersonaById(callout.themeId, callout.personaId), callout.decisionId).toBeDefined()
      expect(callout.line.length).toBeGreaterThan(20)
    }
  })

  it('progress defaults include an empty journal', async () => {
    const progress = await getProgress('russian')
    expect(progress.decisions).toEqual([])
  })
})

describe('isTermKnown', () => {
  it('is false for an uncaptured term, false before review, true after a correct review', async () => {
    expect(await isTermKnown('russian', 'свобода')).toBe(false)

    const word = await addWord({ themeId: 'russian', term: 'свобода', translation: 'freedom' })
    expect(await isTermKnown('russian', 'свобода')).toBe(false)

    await reviewWord(word.id, QUALITY.GOOD)
    expect(await isTermKnown('russian', 'СВОБОДА')).toBe(true)
  })

  it('every gated term is a real seed word, so gates are attainable out of the box', async () => {
    const { seedSampleWords } = await import('../db/seedWords.js')
    const { getWordsByTheme } = await import('../db/wordsRepo.js')
    for (const [themeId, scenes] of Object.entries(STORY_SCENES)) {
      const gatedTerms = scenes.flatMap((s) => s.choices.filter((c) => c.requiresTerm).map((c) => c.requiresTerm))
      if (gatedTerms.length === 0) continue
      await seedSampleWords(themeId)
      const archived = new Set((await getWordsByTheme(themeId)).map((w) => w.term.toLowerCase()))
      for (const term of gatedTerms) {
        expect(archived.has(term.toLowerCase()), `${themeId}:${term}`).toBe(true)
      }
    }
  })
})

describe('themes stay at parity with each other', () => {
  it('gives every theme the same narrative surface area', async () => {
    const { listThemes } = await import('../themes/index.js')
    const { ACTS } = await import('./acts.js')
    const { INTERCEPTS } = await import('./intercepts.js')
    const { MEMENTOS } = await import('./mementos.js')

    for (const theme of listThemes()) {
      const scenes = STORY_SCENES[theme.id]
      expect(scenes, theme.id).toHaveLength(8)
      expect(ACTS[theme.id], theme.id).toHaveLength(3)
      expect(INTERCEPTS[theme.id], theme.id).toBeDefined()
      expect(Object.keys(MEMENTOS).filter((k) => k.startsWith(`${theme.id}:`)), theme.id).toHaveLength(4)
      // Every persona's FINAL scene is word-gated: the climax of a
      // relationship is the moment the app asks you to actually know the
      // language, and it is the same rule in all five eras.
      for (const scene of scenes.filter((s) => s.tier === 'ally')) {
        expect(
          scene.choices.some((c) => c.requiresTerm),
          `${scene.id} is an ally scene with no word gate`
        ).toBe(true)
      }
    }
  })
})
