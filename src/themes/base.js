/**
 * @typedef {Object} ThemeAudio
 * @property {string} [radioTrack] - Path to the looping ambient/radio theme audio
 * @property {string} [stampSound] - Played when a word is filed/archived
 * @property {string} [correctSound] - Played on a correct review answer
 * @property {string} [incorrectSound] - Played on an incorrect review answer
 * @property {string} [startupSound] - Played once when the theme is first activated
 * @property {string} [sfxVariant] - which procedural SFX set audio/sfx.js should use, e.g. "nautical"
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
 * @typedef {Object} ThemeStage
 * @property {string} id - unique slug within the theme, e.g. "republic"
 * @property {string} name - display name, e.g. "Cumhuriyet"
 * @property {number} minLevel - lowest player level at which this stage applies
 * @property {Partial<ThemeColors>} [colors] - overrides merged onto the theme's base colors
 * @property {string} [emblem] - overrides the theme's base watermark glyph
 */

/**
 * @typedef {Object} ThemeTensionLevel
 * @property {string} name - display name, e.g. "La Terreur"
 * @property {Partial<ThemeColors>} [colors] - overrides merged onto the theme's base colors
 * @property {string} [emblem] - overrides the theme's base watermark glyph
 * @property {string} [fontHeading] - overrides the theme's base heading font at this tension tier
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
 * @property {string} [terminalName] - big header title, e.g. "K.G.B. TERMINAL"
 * @property {string} [terminalVersion] - small version tag next to the header title
 * @property {string} [tagline] - header subtitle line; "{level}" is replaced with the player's level
 * @property {string} [stampSuccessWord] - short (<=12 char) foreign-language stamp word for a correct answer
 * @property {string} [stampSuccessFlavor] - one-line Turkish flavor text shown under the success stamp
 * @property {string} [stampFailWord] - short (<=12 char) foreign-language stamp word for a missed answer
 * @property {string} [stampFailFlavor] - one-line Turkish flavor text shown under the fail stamp
 * @property {string} [strugglingLabel] - tag shown on words currently missed/re-drilled, e.g. "DESERTOR"
 * @property {string} [eyebrowLabel] - small label above the term on the review card, e.g. "★ ЦЕЛЬ"
 * @property {string} [nextButtonLabel] - label for the "next word" button
 * @property {string} [intelLabel] - heading above the word's historical trivia box
 * @property {string} [archiveStampLabel] - short stamp text on each archive dossier card, e.g. "TOP SECRET"
 * @property {ThemeStage[]} [stages] - level-gated visual evolution; highest matching minLevel wins
 * @property {ThemeTensionLevel[]} [tensionLevels] - ephemeral, session-local visual escalation
 *   indexed by tier (0 = calmest); unlike `stages`, this is driven by in-session performance
 *   (e.g. consecutive misses), not player level, and is applied only within the review screen
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
    terminalName: 'TERMINAL',
    terminalVersion: '',
    tagline: '',
    stampSuccessWord: 'CORRECT',
    stampSuccessFlavor: '',
    stampFailWord: 'MISSED',
    stampFailFlavor: '',
    strugglingLabel: '',
    eyebrowLabel: 'TARGET',
    nextButtonLabel: 'NEXT →',
    intelLabel: 'INTEL',
    archiveStampLabel: 'FILED',
    stages: [],
    tensionLevels: [],
    ...partial,
    colors: { ...DEFAULT_COLORS, ...partial.colors },
    effects: { ...DEFAULT_EFFECTS, ...partial.effects },
  }
}

/**
 * Picks the highest-minLevel stage the player has reached, or null if the
 * theme has no stages or the player hasn't reached any of them yet.
 * @param {ThemeConfig} theme
 * @param {number} level
 * @returns {ThemeStage | null}
 */
export function resolveThemeStage(theme, level) {
  const eligible = (theme.stages ?? []).filter((stage) => level >= stage.minLevel)
  if (eligible.length === 0) return null
  return eligible.reduce((best, stage) => (stage.minLevel > best.minLevel ? stage : best))
}

/**
 * Resolves the effective colors/emblem/stage-name for a theme at a given
 * player level, merging any stage overrides onto the theme's base visuals.
 * @param {ThemeConfig} theme
 * @param {number} level
 * @returns {{colors: ThemeColors, emblem: string | undefined, stageName: string | null}}
 */
export function resolveThemeVisuals(theme, level) {
  const stage = resolveThemeStage(theme, level)
  return {
    colors: { ...theme.colors, ...(stage?.colors ?? {}) },
    emblem: stage?.emblem ?? theme.emblem,
    stageName: stage?.name ?? null,
  }
}

/**
 * Resolves the effective colors/emblem/heading-font for a theme at a given
 * session-local tension tier (0 = calmest), merging any tensionLevels
 * override onto the theme's base visuals. Unlike resolveThemeVisuals, this
 * has nothing to do with player level or persisted progress.
 * @param {ThemeConfig} theme
 * @param {number} tier
 * @returns {{colors: ThemeColors, emblem: string | undefined, fontHeading: string, name: string | null}}
 */
export function resolveTensionVisuals(theme, tier) {
  const level = (theme.tensionLevels ?? [])[tier]
  return {
    colors: { ...theme.colors, ...(level?.colors ?? {}) },
    emblem: level?.emblem ?? theme.emblem,
    fontHeading: level?.fontHeading ?? theme.fontHeading,
    name: level?.name ?? null,
  }
}
