import { russianTheme } from './russian.js'

/** @type {Record<string, import('./base.js').ThemeConfig>} */
export const THEMES = {
  [russianTheme.id]: russianTheme,
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
