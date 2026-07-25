/**
 * Daily directives: a themed standing order that changes how today's
 * reviews play, one per theme, active roughly every other day (date-hash
 * parity — same trick as worldEvents/bounties, zero storage). Each carries
 * a REAL mechanical effect the review loop honors, not just flavor text:
 *
 * - russian  `hard-lessons`: slow, effortful correct answers (FSRS "Hard")
 *   pay double XP — the Committee rewards words wrestled down, not lucky.
 * - italian  `pax-romana`: tension does not rise today; the screen stays
 *   calm no matter the misses. Study, don't panic.
 * - french   `sharpened-blade`: every miss raises tension by two tiers —
 *   the mob's patience is thinner than usual.
 * - spanish  `dead-airwaves`: faction reputation gains are doubled — the
 *   radio tower is down, so every confirmed dispatch counts twice.
 * - portuguese `fair-winds`: answers inside 5 seconds pay +50% XP — the
 *   tide won't wait for a hesitant navigator.
 */

/**
 * @typedef {Object} DirectiveDef
 * @property {string} id
 * @property {string} icon
 * @property {string} label - short banner heading
 * @property {string} order - the in-world directive text
 * @property {'hardXp2'|'noTension'|'doubleMissTension'|'doubleReputation'|'fastXp'} effect
 */

/** @type {Record<string, DirectiveDef>} */
const DIRECTIVES = {
  russian: {
    id: 'hard-lessons',
    icon: '📕',
    label: 'COMMITTEE ORDER',
    order: 'Hard-won intelligence pays double today: effortful correct recalls earn ×2 XP.',
    effect: 'hardXp2',
  },
  italian: {
    id: 'pax-romana',
    icon: '🕊',
    label: 'PAX ROMANA',
    order: 'The Senate declares peace. Tension will not rise today — study in calm.',
    effect: 'noTension',
  },
  french: {
    id: 'sharpened-blade',
    icon: '🗡',
    label: 'THE BLADE IS SHARPENED',
    order: 'The mob is restless. Every miss today raises tension twice as fast.',
    effect: 'doubleMissTension',
  },
  spanish: {
    id: 'dead-airwaves',
    icon: '📻',
    label: 'RADIO TOWER DOWN',
    order: 'The airwaves are dead — every confirmed dispatch counts double faction reputation.',
    effect: 'doubleReputation',
  },
  portuguese: {
    id: 'fair-winds',
    icon: '🌬',
    label: 'FAIR WINDS',
    order: 'The tide favors the decisive: answers inside 5 seconds earn +50% XP.',
    effect: 'fastXp',
  },
}

/** Deterministic day-hash, same recipe as bounties.js. */
function hashDay(dayKey) {
  let hash = 0
  for (let i = 0; i < dayKey.length; i++) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Today's directive for a theme, or null on an off day. Parity of a
 * theme-salted day hash keeps each theme on its own ~every-other-day
 * rhythm rather than all five switching on and off together.
 * @param {string} themeId
 * @param {string} [dayKey] - YYYY-MM-DD
 * @returns {DirectiveDef | null}
 */
export function getDailyDirective(themeId, dayKey = new Date().toISOString().slice(0, 10)) {
  const def = DIRECTIVES[themeId]
  if (!def) return null
  return hashDay(`${themeId}:${dayKey}`) % 2 === 0 ? def : null
}
