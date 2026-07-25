import { findFalseFriend } from '../progression/falseFriends.js'

/**
 * The first ten reviews are scripted, not random.
 *
 * Every rare encounter in this app is a dice roll — an NPC intercept at
 * 5%, a radio dictation crisis at 3%, a false friend only if the player
 * happens to have captured one. For a returning player that variety is
 * the point. For a brand-new one it is a coin flip on whether the app
 * ever shows what makes it different: they might see nothing unusual at
 * all, or get a blacked-out dictation crisis as their second ever card
 * and quit.
 *
 * So the opening is choreographed. Plain cards establish the loop, then
 * one guaranteed false friend — the single most convincing ten seconds in
 * the product, because it is a real linguistic trap and not a game
 * mechanic — then a mentor speaks, which is the whole RPG hook delivered
 * as a person rather than an explanation. Nothing else fires until the
 * script is done.
 */

/** Reviews covered by the scripted opening. */
export const FIRST_SESSION_LENGTH = 10

/** 0-based index of the card that is guaranteed to be a double agent. */
export const SCRIPTED_TRAP_INDEX = 3

/** 0-based index after which a mentor is guaranteed to speak. */
export const SCRIPTED_MENTOR_INDEX = 5

/**
 * @param {number} lifetimeReviews - reviews ever graded in this theme
 * @returns {boolean}
 */
export function isFirstSession(lifetimeReviews) {
  return lifetimeReviews < FIRST_SESSION_LENGTH
}

/**
 * Reorders a due queue so the scripted beats land where they are meant
 * to. Only the trap needs moving: it is pulled to SCRIPTED_TRAP_INDEX so
 * the player meets a false friend early instead of by luck. Everything
 * else keeps its scheduler order.
 *
 * A no-op when the theme has no false friend in the queue, or when the
 * opening is already over.
 * @param {Array<{term: string}>} words
 * @param {string} themeId
 * @param {number} lifetimeReviews
 * @returns {Array<{term: string}>}
 */
export function orderFirstSessionQueue(words, themeId, lifetimeReviews) {
  if (!isFirstSession(lifetimeReviews)) return words
  const position = SCRIPTED_TRAP_INDEX - lifetimeReviews
  if (position < 0 || position >= words.length) return words

  const trapIndex = words.findIndex((w) => findFalseFriend(themeId, w.term))
  if (trapIndex === -1 || trapIndex === position) return words

  const reordered = [...words]
  const [trap] = reordered.splice(trapIndex, 1)
  reordered.splice(position, 0, trap)
  return reordered
}

/**
 * Whether a random rare encounter (NPC intercept, radio crisis) may fire.
 * Suppressed for the whole scripted opening so the newcomer meets the
 * systems in a deliberate order rather than all at once.
 * @param {number} lifetimeReviews
 * @returns {boolean}
 */
export function allowsRandomEncounters(lifetimeReviews) {
  return !isFirstSession(lifetimeReviews)
}

/**
 * Whether a mentor should speak after this review regardless of how it
 * went. Fires once, on the scripted beat, so every new player meets a
 * member of the cast in their first session instead of only on a miss or
 * a milestone they may not hit.
 * @param {number} lifetimeReviewsBefore - count before this answer
 * @returns {boolean}
 */
export function forcesMentorLine(lifetimeReviewsBefore) {
  return lifetimeReviewsBefore === SCRIPTED_MENTOR_INDEX
}
