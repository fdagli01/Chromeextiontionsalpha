import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getTheme, listThemes } from '../themes/index.js'
import { awardReputation } from '../db/factionsRepo.js'
import { getFactionsForTheme } from '../factions/factions.js'
import { getProgress, saveProgress } from '../db/progressRepo.js'
import { STORY_SCENES } from './storyScenes.js'
import { getDecision } from './decisions.js'
import { claimEnding, getPendingEnding } from './endings.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

/** Journals every scene in a theme's arc as resolved, with an arbitrary choice. */
async function completeFullArc(themeId) {
  const progress = await getProgress(themeId)
  const decisions = STORY_SCENES[themeId].map((s) => ({
    id: `scene:${s.id}`,
    choiceId: s.choices[0].id,
    at: new Date().toISOString(),
  }))
  await saveProgress(themeId, { decisions: [...progress.decisions, ...decisions] })
}

describe('getPendingEnding', () => {
  it('is null with no arc progress at all', async () => {
    expect(await getPendingEnding('russian')).toBeNull()
  })

  it('is null at top level with an incomplete arc', async () => {
    const theme = getTheme('russian')
    await saveProgress('russian', { level: theme.rankNames.length + 2, xp: 99999 })
    expect(await getPendingEnding('russian')).toBeNull()
  })

  it('is null with a complete arc but low level', async () => {
    await completeFullArc('russian')
    await saveProgress('russian', { level: 1 })
    expect(await getPendingEnding('russian')).toBeNull()
  })

  it('returns an ending once both top rank and the full arc are met, for every theme', async () => {
    for (const theme of listThemes()) {
      await completeFullArc(theme.id)
      await saveProgress(theme.id, { level: theme.rankNames.length })
      const ending = await getPendingEnding(theme.id)
      expect(ending, theme.id).not.toBeNull()
      expect(ending.title.length).toBeGreaterThan(0)
      expect(ending.body.length).toBeGreaterThan(50)
    }
  })

  it('picks the high-reputation epilogue when one faction dominates', async () => {
    await completeFullArc('russian')
    await saveProgress('russian', { level: getTheme('russian').rankNames.length })
    const [factionA] = getFactionsForTheme('russian')
    await awardReputation(factionA.factionId, 'russian', 50)
    const ending = await getPendingEnding('russian')
    expect(ending.id).toBe('russian:apparatus')
  })

  it('picks the balanced epilogue when reputations are close', async () => {
    await completeFullArc('french')
    await saveProgress('french', { level: getTheme('french').rankNames.length })
    const ending = await getPendingEnding('french')
    expect(ending.id).toBe('french:witness')
  })
})

describe('claimEnding', () => {
  it('is a one-time journal write that getPendingEnding then respects', async () => {
    await completeFullArc('italian')
    await saveProgress('italian', { level: getTheme('italian').rankNames.length })
    const ending = await getPendingEnding('italian')
    expect(ending).not.toBeNull()

    await claimEnding('italian', ending)
    expect(await getPendingEnding('italian')).toBeNull()
    const decision = await getDecision('italian', 'ending')
    expect(decision.choiceId).toBe(ending.id)
  })
})
