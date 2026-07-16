/**
 * Daily briefing objectives, derived from the day's tracked progress metrics
 * (see xp/xpService.js, which resets these when the quest day rolls over).
 * Each objective is a real, checkable goal — not flavor text — so the
 * briefing card can show live progress and a completed state.
 */

/** @typedef {Object} BriefingObjective
 * @property {string} id
 * @property {string} label - short in-world directive
 * @property {number} current
 * @property {number} target
 * @property {boolean} done
 */

export const BRIEFING_TARGETS = {
  reviews: 5,
  combo: 5,
  xp: 100,
}

/**
 * Builds the three daily objectives for a theme's progress. Metrics only
 * count toward "today" — a stale dailyQuestDate (progress from an earlier
 * day, before the next review resets it) reads as zero so a new day starts
 * with a fresh, empty briefing.
 * @param {import('../db/progressRepo.js').ThemeProgress} progress
 * @param {string} today - YYYY-MM-DD
 * @returns {BriefingObjective[]}
 */
export function computeDailyObjectives(progress, today) {
  const fresh = progress.dailyQuestDate === today
  const reviews = fresh ? progress.dailyReviewCount : 0
  const combo = fresh ? progress.dailyBestCombo : 0
  const xp = fresh ? progress.dailyXp : 0

  return [
    {
      id: 'reviews',
      label: `Process ${BRIEFING_TARGETS.reviews} dispatches`,
      current: Math.min(reviews, BRIEFING_TARGETS.reviews),
      target: BRIEFING_TARGETS.reviews,
      done: reviews >= BRIEFING_TARGETS.reviews,
    },
    {
      id: 'combo',
      label: `Reach a ×2 momentum surge`,
      current: Math.min(combo, BRIEFING_TARGETS.combo),
      target: BRIEFING_TARGETS.combo,
      done: combo >= BRIEFING_TARGETS.combo,
    },
    {
      id: 'xp',
      label: `Bank ${BRIEFING_TARGETS.xp} XP`,
      current: Math.min(xp, BRIEFING_TARGETS.xp),
      target: BRIEFING_TARGETS.xp,
      done: xp >= BRIEFING_TARGETS.xp,
    },
  ]
}

/**
 * @param {BriefingObjective[]} objectives
 * @returns {boolean} whether every objective is complete
 */
export function allObjectivesComplete(objectives) {
  return objectives.length > 0 && objectives.every((o) => o.done)
}
