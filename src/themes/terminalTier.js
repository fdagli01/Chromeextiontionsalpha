/**
 * Physical rank: the review terminal itself visibly ages with the player,
 * independent of any single word or answer. A rookie's desk looks cheap
 * and unstable; a veteran's is pristine and commands a nameplate.
 *
 * Tiers 0-2 track level, reusing the same thresholds as the existing
 * "Promoted"/"General Secretary" badges so the terminal upgrades land on
 * milestones the player already recognizes.
 *
 * Tier 3 is different in kind: it is not earned by levelling at all, but
 * by closing the theme's file — top rank AND every persona's story
 * resolved. It exists because a player who finishes an era otherwise
 * arrives at an ending and then finds the desk looking exactly as it did
 * the day before. The commissioned terminal is the permanent, visible
 * proof that this era is done.
 */

/** Terminal tier ids, lowest first. */
export const TERMINAL_TIERS = {
  ROOKIE: 0,
  STANDARD: 1,
  VETERAN: 2,
  COMMISSIONED: 3,
}

/**
 * @param {number} level
 * @returns {0 | 1 | 2}
 */
export function terminalTierForLevel(level) {
  if (level < 5) return TERMINAL_TIERS.ROOKIE
  if (level >= 10) return TERMINAL_TIERS.VETERAN
  return TERMINAL_TIERS.STANDARD
}

/**
 * The tier a theme's terminal should render at, given the player's whole
 * standing in that era rather than their level alone.
 * @param {{level: number, decisions?: Array<{id: string}>}} progress
 * @returns {0 | 1 | 2 | 3}
 */
export function terminalTierForProgress(progress) {
  if (!progress) return TERMINAL_TIERS.ROOKIE
  // The ending is journaled like any other decision (see endings.js), so
  // "has this era been finished" needs no separate flag.
  const finished = (progress.decisions ?? []).some((d) => d.id === 'ending')
  return finished ? TERMINAL_TIERS.COMMISSIONED : terminalTierForLevel(progress.level)
}
