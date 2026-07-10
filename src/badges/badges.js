/**
 * @typedef {Object} BadgeDef
 * @property {string} id
 * @property {string} icon
 * @property {string} name
 * @property {(progress: {streak: number, level: number, xp: number}) => boolean} check
 */

/** @type {BadgeDef[]} */
export const BADGE_DEFS = [
  { id: 'streak-3', icon: '🔥', name: 'Warming Up', check: (p) => p.streak >= 3 },
  { id: 'streak-5', icon: '🥸', name: "Stalin's Mustache", check: (p) => p.streak >= 5 },
  { id: 'streak-7', icon: '🎖', name: 'Weekly Loyalty', check: (p) => p.streak >= 7 },
  { id: 'streak-14', icon: '🐺', name: "Wolf's Blood", check: (p) => p.streak >= 14 },
  { id: 'level-5', icon: '⭐', name: 'Promoted', check: (p) => p.level >= 5 },
  { id: 'level-10', icon: '👑', name: 'General Secretary', check: (p) => p.level >= 10 },
]

/**
 * Evaluates which badges a progress state has newly earned, without
 * re-awarding ones already present in `progress.badges`.
 * @param {{streak: number, level: number, xp: number, badges?: string[]}} progress
 * @returns {{badges: string[], newlyEarned: BadgeDef[]}}
 */
export function evaluateBadges(progress) {
  const earned = new Set(progress.badges ?? [])
  const newlyEarned = []
  for (const def of BADGE_DEFS) {
    if (!earned.has(def.id) && def.check(progress)) {
      earned.add(def.id)
      newlyEarned.push(def)
    }
  }
  return { badges: Array.from(earned), newlyEarned }
}

/**
 * @param {string[]} ids
 * @returns {BadgeDef[]}
 */
export function resolveBadges(ids) {
  const byId = new Map(BADGE_DEFS.map((b) => [b.id, b]))
  return (ids ?? []).map((id) => byId.get(id)).filter(Boolean)
}
