import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { addTrust } from './affinity.js'
import { recordDecision } from './decisions.js'
import { getDossier } from './dossier.js'
import { STORY_SCENES, getPendingScene, resolveSceneChoice } from './storyScenes.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

async function pushTrust(themeId, personaId, target) {
  for (let day = 1; day <= 30; day++) {
    const { record } = await addTrust(themeId, personaId, 6, new Date(`2026-09-${String(day).padStart(2, '0')}T12:00:00Z`))
    if (record.trust >= target) return record
  }
  throw new Error('trust target not reached')
}

describe('getDossier', () => {
  it('starts empty but still lists the full cast with their unresolved scenes', async () => {
    const d = await getDossier('russian')
    expect(d.journal).toEqual([])
    expect(d.personas.length).toBeGreaterThanOrEqual(4)
    const handler = d.personas.find((p) => p.personaId === 'handler')
    expect(handler.trust).toBe(0)
    expect(handler.scenes).toHaveLength(2)
    expect(handler.scenes.every((s) => !s.resolved)).toBe(true)
    expect(handler.memento).toBeNull()
  })

  it('reports what still stands between the player and their ending', async () => {
    const d = await getDossier('russian')
    expect(d.ending.claimed).toBe(false)
    expect(d.ending.needsRank).toBeTruthy()
    expect(d.ending.scenesRemaining).toBe(STORY_SCENES.russian.length)
  })

  it('records a resolved scene with the exact choice the player made', async () => {
    await pushTrust('russian', 'handler', 50)
    const scene = await getPendingScene('russian')
    const choice = scene.choices[0]
    await resolveSceneChoice('russian', scene, choice)

    const d = await getDossier('russian')
    const handler = d.personas.find((p) => p.personaId === 'handler')
    const resolved = handler.scenes.find((s) => s.sceneId === scene.id)
    expect(resolved.resolved).toBe(true)
    expect(resolved.choiceLabel).toBe(choice.label)
    expect(resolved.response).toBe(choice.response)
    expect(d.ending.scenesRemaining).toBe(STORY_SCENES.russian.length - 1)
  })

  it('surfaces the memento once trust reaches Warm, and sorts the closest first', async () => {
    await pushTrust('russian', 'defector', 50)
    const d = await getDossier('russian')
    expect(d.personas[0].personaId).toBe('defector')
    expect(d.personas[0].memento).not.toBeNull()
    expect(d.personas[0].tier.id).toBe('warm')
  })

  it('gives non-scene decisions a readable label, in the order they happened', async () => {
    await recordDecision('french', 'french-bribe', 'accepted', new Date('2026-05-01T10:00:00Z'))
    await recordDecision('french', 'contraband-sale', 'sold', new Date('2026-05-02T10:00:00Z'))
    const d = await getDossier('french')
    expect(d.journal).toHaveLength(2)
    expect(d.journal[0].label).toContain('gold')
    expect(d.journal[1].label).toContain('black market')
  })
})

describe('a closed file can be re-read', () => {
  it('surfaces the full epilogue text of the ending the player earned', async () => {
    const { getEndingById } = await import('./endings.js')
    await recordDecision('russian', 'ending', 'russian:archivist')

    const d = await getDossier('russian')
    expect(d.ending.claimed).toBe(true)
    expect(d.ending.earned).not.toBeNull()
    expect(d.ending.earned.id).toBe('russian:archivist')
    expect(d.ending.earned.body).toBe(getEndingById('russian:archivist').body)
  })

  it('reports no epilogue while the file is still open', async () => {
    const d = await getDossier('russian')
    expect(d.ending.claimed).toBe(false)
    expect(d.ending.earned).toBeNull()
  })
})
