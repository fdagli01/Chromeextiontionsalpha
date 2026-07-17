import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getProgress } from '../db/progressRepo.js'
import {
  ARTIFACT_CATALOG,
  FRAGMENTS_PER_ARTIFACT,
  getVaultForTheme,
  mintNextFragment,
  recordBountyCompletion,
  recordRedemption,
  recordStreakTierReached,
} from './artifacts.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('ARTIFACT_CATALOG', () => {
  it('defines exactly two artifacts per theme, each with a name, icon, image, and fact', () => {
    for (const themeId of ['russian', 'italian', 'portuguese', 'french', 'spanish']) {
      const artifacts = ARTIFACT_CATALOG[themeId]
      expect(artifacts).toHaveLength(2)
      for (const a of artifacts) {
        expect(a.name.length).toBeGreaterThan(0)
        expect(a.icon.length).toBeGreaterThan(0)
        expect(a.image).toBeTruthy()
        expect(a.fact.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('mintNextFragment', () => {
  it('fills the first artifact before starting the second, in catalog order', async () => {
    const [first, second] = ARTIFACT_CATALOG.russian

    for (let i = 0; i < FRAGMENTS_PER_ARTIFACT; i++) {
      const result = await mintNextFragment('russian')
      expect(result.artifact.id).toBe(first.id)
      expect(result.fragments).toBe(i + 1)
      expect(result.justCompleted).toBe(i + 1 === FRAGMENTS_PER_ARTIFACT)
    }

    const nextResult = await mintNextFragment('russian')
    expect(nextResult.artifact.id).toBe(second.id)
    expect(nextResult.fragments).toBe(1)
  })

  it('returns null once every artifact for the theme is complete', async () => {
    const totalFragments = ARTIFACT_CATALOG.italian.length * FRAGMENTS_PER_ARTIFACT
    for (let i = 0; i < totalFragments; i++) {
      await mintNextFragment('italian')
    }
    expect(await mintNextFragment('italian')).toBeNull()
  })
})

describe('getVaultForTheme', () => {
  it('reflects fragment counts and completion state', async () => {
    await mintNextFragment('portuguese')
    const vault = await getVaultForTheme('portuguese')
    expect(vault).toHaveLength(2)
    expect(vault[0].fragments).toBe(1)
    expect(vault[0].complete).toBe(false)
    expect(vault[1].fragments).toBe(0)
  })
})

describe('recordRedemption', () => {
  it('mints a fragment only on every 3rd redemption', async () => {
    let progress = await getProgress('french')
    expect(await recordRedemption('french', progress)).toBeNull()
    progress = await getProgress('french')
    expect(await recordRedemption('french', progress)).toBeNull()
    progress = await getProgress('french')
    const result = await recordRedemption('french', progress)
    expect(result).not.toBeNull()
    expect(result.fragments).toBe(1)
  })
})

describe('recordStreakTierReached', () => {
  it('mints a fragment immediately', async () => {
    const result = await recordStreakTierReached('spanish')
    expect(result).not.toBeNull()
    expect(result.fragments).toBe(1)
  })
})

describe('recordBountyCompletion', () => {
  it('mints a fragment only on every 3rd completed bounty', async () => {
    let progress = await getProgress('russian')
    expect(await recordBountyCompletion('russian', progress)).toBeNull()
    progress = await getProgress('russian')
    expect(await recordBountyCompletion('russian', progress)).toBeNull()
    progress = await getProgress('russian')
    const result = await recordBountyCompletion('russian', progress)
    expect(result).not.toBeNull()
  })
})
