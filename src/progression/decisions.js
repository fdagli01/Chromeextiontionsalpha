import { getProgress, saveProgress } from '../db/progressRepo.js'

/**
 * The decision journal: every meaningful choice the player makes — story
 * scene outcomes, taking the aristocrat's bribe, fencing contraband — is
 * recorded permanently against the theme. Personas read this journal to
 * throw the player's past back at them, and endings will weigh it. This is
 * the Papers-Please spine of the narrative layer: the world remembers.
 * @typedef {Object} DecisionEntry
 * @property {string} id - stable decision id, e.g. "scene:ru-defector-warm" or "french-bribe"
 * @property {string} choiceId - which way the player went
 * @property {string} at - ISO timestamp
 */

/**
 * Records a decision exactly once — replays of the same moment (a second
 * bribe offer, a re-triggered scene guard) never overwrite the first
 * choice. History is written in ink.
 * @param {string} themeId
 * @param {string} decisionId
 * @param {string} choiceId
 * @param {Date} [now]
 * @returns {Promise<import('../db/progressRepo.js').ThemeProgress>}
 */
export async function recordDecision(themeId, decisionId, choiceId, now = new Date()) {
  const progress = await getProgress(themeId)
  if (progress.decisions.some((d) => d.id === decisionId)) return progress
  return saveProgress(themeId, {
    decisions: [...progress.decisions, { id: decisionId, choiceId, at: now.toISOString() }],
  })
}

/**
 * @param {string} themeId
 * @param {string} decisionId
 * @returns {Promise<DecisionEntry | null>}
 */
export async function getDecision(themeId, decisionId) {
  const progress = await getProgress(themeId)
  return progress.decisions.find((d) => d.id === decisionId) ?? null
}
