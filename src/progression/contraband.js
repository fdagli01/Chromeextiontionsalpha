import { getFactionsForTheme } from '../factions/factions.js'

/**
 * Daily contraband: one of today's factions declares a whole category of
 * words illegal to traffic in — a date-derived rule (same zero-storage
 * trick as bounties.js/directives.js), independent per theme. A word
 * matching the rule that the player answers correctly can be fenced on the
 * Black Market instead of filed normally: a fat XP payout and a nudge of
 * trust with the theme's top-affinity persona, at the cost of reputation
 * with whichever faction *didn't* declare the ban (a real tradeoff, not
 * flavor text).
 * @typedef {Object} ContrabandRule
 * @property {string} id
 * @property {string} icon
 * @property {string} label
 * @property {string} order - in-world declaration text
 * @property {(term: string) => boolean} matches
 */

/** Flat XP paid out when a contraband word is fenced on the Black Market. */
export const CONTRABAND_SALE_XP = 15

/** Reputation lost with the rival faction for trafficking in banned words. */
export const CONTRABAND_RIVAL_PENALTY = -8

/** Per-theme suffix families a ban can target — each already common enough
 * in the curated word lists to make the rule bite without needing its own
 * keyword roster. */
const SUFFIX_RULES = {
  russian: ['ция', 'ость', 'ство'],
  italian: ['zione', 'ismo', 'tà'],
  french: ['tion', 'isme', 'té'],
  portuguese: ['ção', 'dade', 'mento'],
  spanish: ['ción', 'ismo', 'dad'],
}

/** Deterministic day-hash, same recipe as bounties.js/directives.js. */
function hashDay(dayKey) {
  let hash = 0
  for (let i = 0; i < dayKey.length; i++) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Today's contraband rule for a theme.
 * @param {string} themeId
 * @param {string} [dayKey] - YYYY-MM-DD
 * @returns {ContrabandRule | null}
 */
export function getDailyContraband(themeId, dayKey = new Date().toISOString().slice(0, 10)) {
  const suffixes = SUFFIX_RULES[themeId]
  if (!suffixes) return null
  const hash = hashDay(`contraband:${themeId}:${dayKey}`)
  const suffix = suffixes[hash % suffixes.length]
  return {
    id: `suffix-${suffix}`,
    icon: '📦',
    label: 'CONTRABAND DECLARED',
    order: `Words ending in "-${suffix}" are banned from open filing today. Report them to the Black Market instead.`,
    matches: (term) => term.trim().toLowerCase().endsWith(suffix),
  }
}

/**
 * The faction whose reputation takes the hit when the player fences
 * contraband — deliberately the *other* faction in the theme (the one that
 * didn't declare the ban), so selling reads as picking a side. Themes with
 * only one faction (or none yet unlocked) have no rival to spite.
 * @param {string} themeId
 * @param {string} dayKey
 * @returns {import('../factions/factions.js').FactionDef | null}
 */
export function getContrabandRivalFaction(themeId, dayKey = new Date().toISOString().slice(0, 10)) {
  const factions = getFactionsForTheme(themeId)
  if (factions.length < 2) return null
  const hash = hashDay(`contraband-rival:${themeId}:${dayKey}`)
  return factions[hash % factions.length]
}
