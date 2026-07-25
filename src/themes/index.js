import { russianTheme } from './russian.js'
import { italianTheme } from './italian.js'
import { portugueseTheme } from './portuguese.js'
import { frenchTheme } from './french.js'
import { spanishTheme } from './spanish.js'

export { resolveThemeStage, resolveThemeVisuals, resolveTensionVisuals } from './base.js'

/** @type {Record<string, import('./base.js').ThemeConfig>} */
export const THEMES = {
  [russianTheme.id]: russianTheme,
  [italianTheme.id]: italianTheme,
  [portugueseTheme.id]: portugueseTheme,
  [frenchTheme.id]: frenchTheme,
  [spanishTheme.id]: spanishTheme,
}

export const DEFAULT_THEME_ID = russianTheme.id

/**
 * @param {string} id
 * @returns {import('./base.js').ThemeConfig}
 */
export function getTheme(id) {
  return THEMES[id] ?? THEMES[DEFAULT_THEME_ID]
}

export function listThemes() {
  return Object.values(THEMES)
}
