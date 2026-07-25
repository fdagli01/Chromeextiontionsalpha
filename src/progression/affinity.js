import { getAffinityRecord, saveAffinityRecord } from '../db/affinityRepo.js'
import { getMentor } from './mentors.js'

/** All four review moments a theme's persona cast is keyed by. */
const PERSONA_MOMENTS = ['levelUp', 'streakUp', 'comboMilestone', 'miss']

/** Trust change applied to an aligned / rival persona on a faction reputation gain. */
const FACTION_ALIGNED_TRUST = 2
const FACTION_RIVAL_TRUST = -1

/** Trust is 0-100; every persona starts wary rather than neutral. */
export const TRUST_MIN = 0
export const TRUST_MAX = 100

/** Trust tier boundaries, lowest first. */
export const TRUST_TIERS = [
  { id: 'suspicious', label: 'SUSPICIOUS', min: 0 },
  { id: 'neutral', label: 'NEUTRAL', min: 25 },
  { id: 'warm', label: 'WARM', min: 50 },
  { id: 'ally', label: 'ALLY', min: 75 },
]

/** Max trust a single persona can gain in one calendar day, so no single
 * afternoon of grinding can max out a relationship. */
export const DAILY_TRUST_CAP = 6

/**
 * @param {number} trust
 * @returns {{id: string, label: string, min: number}}
 */
export function tierForTrust(trust) {
  return [...TRUST_TIERS].reverse().find((tier) => trust >= tier.min) ?? TRUST_TIERS[0]
}

/**
 * Adds (or subtracts) trust for one persona, respecting the daily gain cap
 * (losses are never capped — a rival-faction penalty always lands in full)
 * and the 0-100 bounds. Resets the daily-gain counter when the calendar day
 * has rolled over since the last change.
 * @param {string} themeId
 * @param {string} personaId
 * @param {number} amount - positive to build trust, negative to erode it
 * @param {Date} [now]
 * @returns {Promise<{record: import('../db/affinityRepo.js').AffinityRecord, tierChanged: boolean, justBecameAlly: boolean}>}
 */
export async function addTrust(themeId, personaId, amount, now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const current = await getAffinityRecord(themeId, personaId)
  const isNewDay = current.lastTrustDate !== today
  const trustToday = isNewDay ? 0 : current.trustToday

  let delta = amount
  if (amount > 0) {
    const room = Math.max(0, DAILY_TRUST_CAP - trustToday)
    delta = Math.min(amount, room)
  }

  const beforeTier = tierForTrust(current.trust)
  const nextTrust = Math.max(TRUST_MIN, Math.min(TRUST_MAX, current.trust + delta))
  const afterTier = tierForTrust(nextTrust)

  const record = await saveAffinityRecord({
    ...current,
    trust: nextTrust,
    lastTrustDate: today,
    trustToday: trustToday + Math.max(0, delta),
  })

  return {
    record,
    tierChanged: beforeTier.id !== afterTier.id,
    justBecameAlly: beforeTier.id !== 'ally' && afterTier.id === 'ally',
  }
}

/**
 * Marks a persona's one-time Ally reward (word pack + loyalty line) as
 * claimed, so it's never granted twice.
 * @param {string} themeId
 * @param {string} personaId
 * @returns {Promise<void>}
 */
export async function markAllyRewardClaimed(themeId, personaId) {
  const record = await getAffinityRecord(themeId, personaId)
  await saveAffinityRecord({ ...record, allyRewardClaimed: true })
}

/**
 * Applies a faction reputation event to every persona in a theme's cast
 * that has an aligned faction (see mentors.js's `factionId` field): a small
 * trust gain for the persona aligned with whichever faction just gained
 * reputation, a small loss for any persona aligned with a rival faction.
 * Personas with no faction alignment are left untouched. Silently a no-op
 * for themes/personas with nothing to adjust — callers don't need to know
 * which personas happen to have a factionId.
 * @param {string} themeId
 * @param {string[]} matchedFactionIds - factions that just gained reputation this review
 * @returns {Promise<Array<{personaId: string, justBecameAlly: boolean}>>}
 */
export async function applyFactionTrustEvent(themeId, matchedFactionIds) {
  if (matchedFactionIds.length === 0) return []

  const seen = new Set()
  const results = []
  for (const moment of PERSONA_MOMENTS) {
    const persona = getMentor(themeId, moment)
    if (!persona?.factionId || seen.has(persona.id)) continue
    seen.add(persona.id)

    const aligned = matchedFactionIds.includes(persona.factionId)
    const delta = aligned ? FACTION_ALIGNED_TRUST : FACTION_RIVAL_TRUST
    const { justBecameAlly } = await addTrust(themeId, persona.id, delta)
    results.push({ personaId: persona.id, justBecameAlly })
  }
  return results
}
