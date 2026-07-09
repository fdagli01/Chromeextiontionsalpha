/**
 * @typedef {Object} ThemeAudio
 * @property {string} [radioTrack] - Path to the looping ambient/radio theme audio
 * @property {string} [stampSound] - Played when a word is filed/archived
 * @property {string} [correctSound] - Played on a correct review answer
 * @property {string} [incorrectSound] - Played on an incorrect review answer
 * @property {string} [startupSound] - Played once when the theme is first activated
 */

/**
 * @typedef {Object} ThemeColors
 * @property {string} background
 * @property {string} surface
 * @property {string} surfaceStrong - a darker/bolder surface for header/nav chrome
 * @property {string} primary
 * @property {string} accent
 * @property {string} text
 * @property {string} textMuted
 * @property {string} border
 * @property {string} danger
 * @property {string} success
 */

/**
 * @typedef {Object} ThemeEffects
 * @property {boolean} paperTexture
 * @property {boolean} vignette
 * @property {boolean} scanlines
 * @property {boolean} flickerOnError
 * @property {boolean} stampOnAdd
 * @property {boolean} watermark - faint emblem centered behind all content
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} id - unique slug, e.g. "russian"
 * @property {string} name - display name, e.g. "Rusça"
 * @property {string} sourceLanguageCode - BCP-47 code of the language being learned, e.g. "ru"
 * @property {string} era - historical/thematic framing, e.g. "Soğuk Savaş / KGB Arşivi"
 * @property {string} fontHeading
 * @property {string} fontBody
 * @property {ThemeColors} colors
 * @property {ThemeAudio} audio
 * @property {ThemeEffects} effects
 * @property {string[]} [rankNames] - optional level-based rank names for this theme
 * @property {string} [emblem] - single character/glyph rendered as the watermark
 */

/** @type {ThemeColors} */
export const DEFAULT_COLORS = {
  background: '#1a1a1a',
  surface: '#242424',
  surfaceStrong: '#141414',
  primary: '#8b0000',
  accent: '#c9a227',
  text: '#e8e2d0',
  textMuted: '#a39c8a',
  border: '#3a3a3a',
  danger: '#a11f1f',
  success: '#4a7c3f',
}

/** @type {ThemeEffects} */
export const DEFAULT_EFFECTS = {
  paperTexture: false,
  vignette: false,
  scanlines: false,
  flickerOnError: false,
  stampOnAdd: false,
  watermark: false,
}

/**
 * Fills in any missing fields on a partial theme with sane defaults so every
 * theme module only needs to declare what makes it distinct.
 * @param {Partial<ThemeConfig>} partial
 * @returns {ThemeConfig}
 */
export function defineTheme(partial) {
  return {
    fontHeading: 'Georgia, serif',
    fontBody: 'Georgia, serif',
    audio: {},
    rankNames: [],
    ...partial,
    colors: { ...DEFAULT_COLORS, ...partial.colors },
    effects: { ...DEFAULT_EFFECTS, ...partial.effects },
  }
}
