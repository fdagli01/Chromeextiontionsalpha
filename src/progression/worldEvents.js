/**
 * Calendar-driven "world events" — limited-time modifiers that make certain
 * days feel special and give a reason to come back. Purely date-derived (no
 * storage, no network), so the same day always yields the same event and it
 * can be unit-tested deterministically.
 */

/** @typedef {Object} WorldEvent
 * @property {string} id
 * @property {string} icon
 * @property {string} label - short banner text
 * @property {string} blurb - one-line description of the modifier
 * @property {number} xpMultiplier - global XP multiplier while active
 */

/**
 * The active world event for a given date, or null on an ordinary day.
 * Weekends run a "Double Dispatch" ×2 event; the first of each month is a
 * ×1.5 "Founding Day". Weekend takes precedence when both would apply.
 * @param {Date} [now]
 * @returns {WorldEvent | null}
 */
export function getActiveWorldEvent(now = new Date()) {
  const day = now.getDay()
  if (day === 0 || day === 6) {
    return {
      id: 'double-dispatch',
      icon: '📡',
      label: 'DOUBLE DISPATCH',
      blurb: 'Weekend surge — all reviews earn ×2 XP.',
      xpMultiplier: 2,
    }
  }
  if (now.getDate() === 1) {
    return {
      id: 'founding-day',
      icon: '🎖',
      label: 'FOUNDING DAY',
      blurb: 'A new month opens — reviews earn ×1.5 XP today.',
      xpMultiplier: 1.5,
    }
  }
  return null
}

/**
 * @param {WorldEvent | null} event
 * @returns {number} the event's XP multiplier, or 1 when there's no event
 */
export function worldEventMultiplier(event) {
  return event ? event.xpMultiplier : 1
}
