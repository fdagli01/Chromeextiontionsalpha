import { STORE_PROGRESS, withStore } from './connection.js'

/**
 * @typedef {Object} ThemeProgress
 * @property {string} themeId
 * @property {number} xp
 * @property {number} level
 * @property {number} streak - consecutive days with at least one review
 * @property {string|null} lastActiveDate - ISO date (YYYY-MM-DD) of last activity
 * @property {string[]} badges - ids of earned badges, see badges/badges.js
 * @property {string|null} dailyQuestDate - ISO date (YYYY-MM-DD) dailyReviewCount is counting for
 * @property {number} dailyReviewCount - reviews graded on dailyQuestDate
 * @property {boolean} dailyQuestClaimed - whether today's quest bonus XP has been awarded
 * @property {string[]} secretsUnlocked - lowercased terms whose one-time secret anecdote has been revealed
 * @property {number} streakShields - streak-insurance tokens; one is auto-spent to forgive a single missed day
 * @property {number} dailyBestCombo - best consecutive-correct combo reached on dailyQuestDate
 * @property {number} dailyXp - XP earned on dailyQuestDate (for daily-briefing objectives)
 * @property {number} redemptionCount - lifetime count of previously-struggling words recalled correctly (Vault fragment trigger)
 * @property {number} bountyCompletionCount - lifetime count of completed daily field bounties (Vault fragment trigger)
 * @property {number} doubleAgentsExposed - lifetime count of false-friend words answered correctly (badge trigger)
 */

/**
 * @param {string} themeId
 * @returns {ThemeProgress}
 */
function emptyProgress(themeId) {
  return {
    themeId,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    badges: [],
    dailyQuestDate: null,
    dailyReviewCount: 0,
    dailyQuestClaimed: false,
    secretsUnlocked: [],
    streakShields: 0,
    dailyBestCombo: 0,
    dailyXp: 0,
    redemptionCount: 0,
    bountyCompletionCount: 0,
    doubleAgentsExposed: 0,
  }
}

/**
 * @param {string} themeId
 * @returns {Promise<ThemeProgress>}
 */
export async function getProgress(themeId) {
  const existing = await withStore(STORE_PROGRESS, 'readonly', (store) => store.get(themeId))
  if (!existing) return emptyProgress(themeId)
  return {
    badges: [],
    dailyQuestDate: null,
    dailyReviewCount: 0,
    dailyQuestClaimed: false,
    secretsUnlocked: [],
    streakShields: 0,
    dailyBestCombo: 0,
    dailyXp: 0,
    redemptionCount: 0,
    bountyCompletionCount: 0,
    doubleAgentsExposed: 0,
    ...existing,
  }
}

/**
 * @param {string} themeId
 * @param {Partial<ThemeProgress>} patch
 * @returns {Promise<ThemeProgress>}
 */
export async function saveProgress(themeId, patch) {
  const current = await getProgress(themeId)
  const updated = { ...current, ...patch, themeId }
  await withStore(STORE_PROGRESS, 'readwrite', (store) => store.put(updated))
  return updated
}
