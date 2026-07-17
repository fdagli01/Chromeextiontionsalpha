import { listThemes } from '../themes/index.js'

/**
 * Daily field bounties: a deterministic, date-derived hunting objective that
 * gives the player a reason to actively capture words on the open web today,
 * rather than just reviewing what's already archived. Same trick as
 * worldEvents.js — pure function of the date, so "today's bounty" needs no
 * storage and is trivially unit-testable.
 * @typedef {Object} Bounty
 * @property {string} id
 * @property {string} directive - in-world instruction text, "{n}" placeholders already filled
 * @property {number} target
 * @property {(ctx: {term: string, themeId: string, pageUrl: string}) => boolean} check
 */

const LETTER_POOL = ['a', 'e', 'i', 'o', 'r', 's', 't', 'n', 'l', 'c']
const TLD_POOL = ['es', 'fr', 'it', 'pt', 'ru']

/** Small deterministic string hash — same day always yields the same number. */
function hashDay(dayKey) {
  let hash = 0
  for (let i = 0; i < dayKey.length; i++) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Extracts the registrable hostname suffix check — must match the *end* of
 * the hostname on a label boundary, so "elpais.es" and "www.elpais.es"
 * match ".es" but "elpais.es.evil.com" does not.
 * @param {string} pageUrl
 * @param {string} tld
 * @returns {boolean}
 */
function hostnameEndsInTld(pageUrl, tld) {
  let hostname
  try {
    hostname = new URL(pageUrl).hostname.toLowerCase()
  } catch {
    return false
  }
  return hostname === tld || hostname.endsWith(`.${tld}`)
}

/**
 * @param {string} dayKey - YYYY-MM-DD
 * @returns {Bounty}
 */
export function getDailyBounty(dayKey = new Date().toISOString().slice(0, 10)) {
  const hash = hashDay(dayKey)
  const kind = hash % 4

  if (kind === 0) {
    const tld = TLD_POOL[hash % TLD_POOL.length]
    return {
      id: 'domain-intel',
      directive: `Capture 3 words from a .${tld} site — the archive needs local sources.`,
      target: 3,
      check: (ctx) => hostnameEndsInTld(ctx.pageUrl, tld),
    }
  }
  if (kind === 1) {
    const letter = LETTER_POOL[hash % LETTER_POOL.length]
    return {
      id: 'letter-hunt',
      directive: `Intercept 5 words containing the letter "${letter.toUpperCase()}".`,
      target: 5,
      check: (ctx) => ctx.term.toLowerCase().includes(letter),
    }
  }
  if (kind === 2) {
    return {
      id: 'long-signal',
      directive: 'Only substantial intel today: capture 3 words of 8+ letters.',
      target: 3,
      check: (ctx) => ctx.term.replace(/\s/g, '').length >= 8,
    }
  }

  const themes = listThemes()
  const theme = themes[hash % themes.length]
  return {
    id: 'fresh-front',
    directive: `The ${theme.name} desk is short-staffed. File 3 words under it.`,
    target: 3,
    check: (ctx) => ctx.themeId === theme.id,
  }
}

const STORAGE_KEY = 'bountyState'

/**
 * @typedef {Object} BountyState
 * @property {string} date
 * @property {string} bountyId
 * @property {number} count
 * @property {boolean} claimed
 * @property {boolean} celebrated - whether the popup has shown the completion toast yet
 */

/**
 * @param {Date} [now]
 * @returns {Promise<BountyState>}
 */
export async function getBountyState(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const bounty = getDailyBounty(today)
  const { [STORAGE_KEY]: stored } = await chrome.storage.local.get(STORAGE_KEY)
  if (stored?.date === today && stored.bountyId === bounty.id) return stored
  const fresh = { date: today, bountyId: bounty.id, count: 0, claimed: false, celebrated: false }
  await chrome.storage.local.set({ [STORAGE_KEY]: fresh })
  return fresh
}

/**
 * Records a freshly-captured word against today's bounty, if it matches.
 * Only ever called for a genuinely new word (see background/index.js) — a
 * re-capture of an already-archived term never advances a bounty.
 * @param {{term: string, themeId: string, pageUrl: string}} ctx
 * @param {Date} [now]
 * @returns {Promise<{state: BountyState, justCompleted: boolean}>}
 */
export async function recordBountyCapture(ctx, now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const bounty = getDailyBounty(today)
  const state = await getBountyState(now)

  if (state.claimed || !bounty.check(ctx)) return { state, justCompleted: false }

  const count = Math.min(bounty.target, state.count + 1)
  const justCompleted = count >= bounty.target
  const nextState = { ...state, count, claimed: justCompleted }
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState })
  return { state: nextState, justCompleted }
}

/**
 * Marks today's completed bounty as having shown its one-time celebration
 * in the popup (mentor line + chip in ReviewScreen), so reopening the popup
 * later the same day doesn't replay it.
 * @param {Date} [now]
 * @returns {Promise<void>}
 */
export async function markBountyCelebrated(now = new Date()) {
  const state = await getBountyState(now)
  if (state.celebrated) return
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...state, celebrated: true } })
}
