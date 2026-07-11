import { describe, expect, it } from 'vitest'
import { defineTheme, resolveTensionVisuals, resolveThemeStage, resolveThemeVisuals } from './base.js'
import { getTheme, listThemes } from './index.js'

const stagedTheme = defineTheme({
  id: 'test-staged',
  colors: { primary: '#111111' },
  emblem: 'A',
  stages: [
    { id: 'one', name: 'One', minLevel: 1, colors: {}, emblem: 'A' },
    { id: 'two', name: 'Two', minLevel: 4, colors: { primary: '#222222' }, emblem: 'B' },
    { id: 'three', name: 'Three', minLevel: 8, colors: { primary: '#333333' }, emblem: 'C' },
  ],
})

describe('resolveThemeStage', () => {
  it('returns null for a theme with no stages', () => {
    const plain = defineTheme({ id: 'plain' })
    expect(resolveThemeStage(plain, 10)).toBeNull()
  })

  it('picks the highest minLevel stage the player has reached', () => {
    expect(resolveThemeStage(stagedTheme, 1).id).toBe('one')
    expect(resolveThemeStage(stagedTheme, 5).id).toBe('two')
    expect(resolveThemeStage(stagedTheme, 20).id).toBe('three')
  })

  it('returns null below the lowest stage threshold', () => {
    const gatedTheme = defineTheme({
      id: 'gated',
      stages: [{ id: 'late', name: 'Late', minLevel: 5 }],
    })
    expect(resolveThemeStage(gatedTheme, 1)).toBeNull()
  })
})

describe('resolveThemeVisuals', () => {
  it('merges stage color overrides onto the base palette', () => {
    const visuals = resolveThemeVisuals(stagedTheme, 5)
    expect(visuals.colors.primary).toBe('#222222')
    expect(visuals.emblem).toBe('B')
    expect(visuals.stageName).toBe('Two')
  })

  it('falls back to the theme base colors/emblem before any stage is reached', () => {
    const gatedTheme = defineTheme({
      id: 'gated2',
      colors: { primary: '#abcabc' },
      emblem: 'Z',
      stages: [{ id: 'late', name: 'Late', minLevel: 5, colors: { primary: '#fff' } }],
    })
    const visuals = resolveThemeVisuals(gatedTheme, 1)
    expect(visuals.colors.primary).toBe('#abcabc')
    expect(visuals.emblem).toBe('Z')
    expect(visuals.stageName).toBeNull()
  })
})

describe('theme registry', () => {
  it('registers all four themes alongside Russian', () => {
    expect(listThemes().map((t) => t.id)).toEqual(
      expect.arrayContaining(['russian', 'italian', 'portuguese', 'french'])
    )
  })

  it('gives the Italian theme four level-gated stages', () => {
    const italian = getTheme('italian')
    expect(italian.stages).toHaveLength(4)
    expect(italian.stages.map((s) => s.minLevel)).toEqual([1, 4, 8, 14])
  })

  it('gives the Portuguese theme four level-gated stages and no tension levels', () => {
    const portuguese = getTheme('portuguese')
    expect(portuguese.stages).toHaveLength(4)
    expect(portuguese.stages.map((s) => s.minLevel)).toEqual([1, 4, 8, 14])
    expect(portuguese.tensionLevels).toEqual([])
  })

  it('gives the French theme four tension tiers and four level-gated stages', () => {
    const french = getTheme('french')
    expect(french.tensionLevels).toHaveLength(4)
    expect(french.stages).toHaveLength(4)
    expect(french.stages.map((s) => s.minLevel)).toEqual([1, 4, 8, 14])
  })

  it('evolves the French palette through the Revolution as the level rises', () => {
    const french = getTheme('french')
    // Ancien Régime: the royal base palette, untouched.
    expect(resolveThemeVisuals(french, 1).colors.primary).toBe(french.colors.primary)
    expect(resolveThemeVisuals(french, 1).stageName).toBe('Ancien Régime')
    // La République: tricolor blue with a red accent.
    expect(resolveThemeVisuals(french, 5).colors.primary).toBe('#1f4f9e')
    expect(resolveThemeVisuals(french, 5).stageName).toBe('La République')
    // L'Empire: Napoleonic green and gold, bee emblem.
    const empire = resolveThemeVisuals(french, 20)
    expect(empire.colors.primary).toBe('#2f5d3a')
    expect(empire.emblem).toBe('🐝')
    expect(empire.stageName).toBe("L'Empire")
  })
})

describe('resolveTensionVisuals', () => {
  const tensionTheme = defineTheme({
    id: 'test-tension',
    colors: { primary: '#111111' },
    emblem: 'A',
    fontHeading: 'Base Font',
    tensionLevels: [
      { name: 'Calm', colors: {}, emblem: 'A' },
      { name: 'Building', colors: { primary: '#222222' } },
      { name: 'Tense', colors: { primary: '#333333' }, emblem: 'B', fontHeading: 'Tense Font' },
    ],
  })

  it('resolves tier 0 to the theme base visuals', () => {
    const visuals = resolveTensionVisuals(tensionTheme, 0)
    expect(visuals.colors.primary).toBe('#111111')
    expect(visuals.emblem).toBe('A')
    expect(visuals.fontHeading).toBe('Base Font')
    expect(visuals.name).toBe('Calm')
  })

  it('merges color overrides at higher tiers and falls back to base emblem/font when unset', () => {
    const visuals = resolveTensionVisuals(tensionTheme, 1)
    expect(visuals.colors.primary).toBe('#222222')
    expect(visuals.emblem).toBe('A')
    expect(visuals.fontHeading).toBe('Base Font')
  })

  it('overrides emblem and font at the top tier', () => {
    const visuals = resolveTensionVisuals(tensionTheme, 2)
    expect(visuals.colors.primary).toBe('#333333')
    expect(visuals.emblem).toBe('B')
    expect(visuals.fontHeading).toBe('Tense Font')
  })

  it('falls back to base visuals for a theme with no tension levels', () => {
    const plain = defineTheme({ id: 'plain2', colors: { primary: '#abcabc' }, emblem: 'Z' })
    const visuals = resolveTensionVisuals(plain, 2)
    expect(visuals.colors.primary).toBe('#abcabc')
    expect(visuals.emblem).toBe('Z')
    expect(visuals.name).toBeNull()
  })
})
