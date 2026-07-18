/**
 * Physical rank: the review terminal itself visibly ages with the player,
 * independent of any single word or answer. A rookie's desk looks cheap
 * and unstable; a veteran's is pristine and commands a nameplate. Pure
 * function of level, reusing the same thresholds as the existing
 * "Promoted"/"General Secretary" badges so the terminal upgrades line up
 * with milestones the player already recognizes.
 * @param {number} level
 * @returns {0 | 1 | 2}
 */
export function terminalTierForLevel(level) {
  if (level < 5) return 0
  if (level >= 10) return 2
  return 1
}
