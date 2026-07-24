import { addWord, getDueWords, getProgress, getSetting, getWordsByTheme, updateWord } from '../db/index.js'
import { getTheme, listThemes } from '../themes/index.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'
import { generateChronicleEntry } from '../facts/aiEngine.js'
import { generateEtymologyEntry } from '../facts/etymologyEngine.js'
import { translateToEnglish } from './translate.js'
import { checkForCrisis, CRISIS_ALARM_NAME, scheduleCrisisChecks } from './crisisScheduler.js'
import { checkStreakGuard, STREAK_GUARD_ALARM_NAME, scheduleStreakGuardChecks } from './streakGuardScheduler.js'
import { getDailyBounty, recordBountyCapture } from '../progression/bounties.js'
import { falseFriendIntel } from '../progression/falseFriends.js'
import { awardBounty } from '../xp/xpService.js'
import { recordBountyCompletion } from '../progression/artifacts.js'

const MENU_ROOT_ID = 'polyglot-chronicle-root'

/** @param {string} themeId */
export function menuIdForTheme(themeId) {
  return `polyglot-chronicle-add-${themeId}`
}

/**
 * Builds the right-click "add word" menu as a submenu with one entry per
 * theme (each using that theme's own flavor text, e.g. "Decrypt intercept"
 * for Russian, "File before the tribunal" for French), so capturing a word
 * always files it under the theme the user explicitly picks — language
 * auto-detection from a single bare word is unreliable, so this replaces
 * relying on whichever theme happens to be "active" at the time. Safe to
 * call repeatedly.
 */
async function createContextMenu() {
  await chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: MENU_ROOT_ID,
    title: 'Polyglot Chronicle: file "%s" as…',
    contexts: ['selection'],
  })
  for (const theme of listThemes()) {
    chrome.contextMenus.create({
      id: menuIdForTheme(theme.id),
      parentId: MENU_ROOT_ID,
      title: theme.contextMenuTitle,
      contexts: ['selection'],
    })
  }
}

chrome.runtime.onInstalled.addListener(createContextMenu)
chrome.runtime.onStartup.addListener(createContextMenu)

chrome.runtime.onInstalled.addListener(scheduleCrisisChecks)
chrome.runtime.onStartup.addListener(scheduleCrisisChecks)

chrome.runtime.onInstalled.addListener(scheduleStreakGuardChecks)
chrome.runtime.onStartup.addListener(scheduleStreakGuardChecks)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CRISIS_ALARM_NAME) checkForCrisis()
  if (alarm.name === STREAK_GUARD_ALARM_NAME) checkStreakGuard()
  // Piggyback on both existing periodic alarms: words become due purely by
  // time passing, so the badge needs refreshing even with zero user activity.
  updateDueBadge()
})

chrome.runtime.onInstalled.addListener(updateDueBadge)
chrome.runtime.onStartup.addListener(updateDueBadge)

/**
 * Toolbar badge: the count of words currently due across every theme, so
 * the extension reads as "3 files waiting for you" at a glance without the
 * popup ever being opened. Cleared entirely at zero — an empty badge is
 * calmer than a "0".
 */
export async function updateDueBadge() {
  try {
    const perTheme = await Promise.all(listThemes().map((theme) => getDueWords(theme.id)))
    const total = perTheme.reduce((sum, words) => sum + words.length, 0)
    await chrome.action.setBadgeText({ text: total > 0 ? (total > 99 ? '99+' : String(total)) : '' })
    await chrome.action.setBadgeBackgroundColor({ color: '#b30000' })
    await chrome.action.setBadgeTextColor({ color: '#ffffff' })
  } catch {
    // Badge is decoration — never let it break capture/review flows.
  }
}

/**
 * Messaging: the content script (page-highlighting) and the popup both call
 * in here. sendResponse + `return true` is the MV3 async-response contract.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'polyglot:getDueTerms') {
    collectDueTerms().then(sendResponse)
    return true
  }
  if (message?.type === 'polyglot:refreshBadge') {
    updateDueBadge()
  }
})

/** Most terms handed to the page highlighter — a safety valve, far above any realistic due count. */
const MAX_HIGHLIGHT_TERMS = 300

/**
 * Gathers every due word across all themes for the page highlighter, each
 * tagged with its theme's accent color. Respects the Mainframe toggle —
 * when highlighting is off this returns {enabled: false} and the content
 * script does nothing at all.
 * @returns {Promise<{enabled: boolean, terms: Array<{term: string, translation: string, color: string}>}>}
 */
export async function collectDueTerms() {
  const enabled = await getSetting('domHighlightEnabled', true)
  if (!enabled) return { enabled: false, terms: [] }

  const themes = listThemes()
  const perTheme = await Promise.all(themes.map((theme) => getDueWords(theme.id)))
  const terms = []
  for (let i = 0; i < themes.length; i++) {
    for (const word of perTheme[i]) {
      terms.push({ term: word.term, translation: word.translation ?? '', color: themes[i].colors.accent })
      if (terms.length >= MAX_HIGHLIGHT_TERMS) return { enabled: true, terms }
    }
  }
  return { enabled: true, terms }
}

chrome.contextMenus.onClicked.addListener((info) => {
  const theme = listThemes().find((t) => menuIdForTheme(t.id) === info.menuItemId)
  if (!theme) return
  const term = info.selectionText?.trim()
  if (term) captureWord(term, theme.id, info.pageUrl)
})

/**
 * Captures a selected word into the chosen theme's archive: fetches an
 * English translation, attaches any curated historical trivia, persists it,
 * and confirms with a themed notification right away. Translation failures
 * don't block the capture — the word is still saved so nothing is lost.
 *
 * AI enrichment (when the term has no curated fact/example/etymology, and
 * the AI Chronicle Engine is enabled with an API key) happens afterward, in
 * the background, via enrichWordWithAi — capture never waits on Gemini, so
 * a slow response or a 429 retry never leaves the user staring at a
 * "nothing happened" popup.
 * @param {string} term
 * @param {string} themeId
 * @param {string} [pageUrl] - the page the selection was captured from, used
 *   only to check today's field bounty (e.g. "capture from a .es site")
 */
export async function captureWord(term, themeId, pageUrl) {
  const theme = getTheme(themeId)

  // Only a genuinely new word advances the daily bounty — re-capturing an
  // already-archived term (e.g. clicking it again on a different page)
  // must not let the player farm bounty progress for free.
  const existing = await getWordsByTheme(themeId)
  const isNewWord = !existing.some((w) => w.term.trim().toLowerCase() === term.toLowerCase())

  const translation = await translateToEnglish(term, theme.sourceLanguageCode)
  // A captured false friend explains its own disguise when no curated
  // trivia exists, so the trap is never a bare, unexplained card.
  const fact = getFact(themeId, term) || falseFriendIntel(themeId, term)
  const transliteration = getTransliteration(themeId, term)
  const example = getExample(themeId, term)
  const philosophy = getPhilosophy(themeId, term)

  const word = await addWord({
    themeId,
    term,
    translation,
    fact,
    transliteration,
    exampleSentence: example?.sentence ?? '',
    exampleTranslation: example?.translation ?? '',
    philosophyNote: philosophy,
  })

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/images/icon128.png',
    title: `Filed — ${theme.name}`,
    message: translation ? `${word.term} — ${translation}` : word.term,
  })

  // Etymology is always empty on a fresh capture, so this is always worth
  // attempting when the AI engine is on — enrichWordWithAi no-ops quickly
  // if it isn't.
  enrichWordWithAi(word.id, themeId, term, { needsFact: !fact, needsExample: !example })

  if (isNewWord) checkBounty(term, themeId, pageUrl)
  updateDueBadge() // a fresh capture is due immediately, so the count just changed
}

/** XP awarded once, the moment a daily field bounty is completed. */
const BOUNTY_REWARD_XP = 40

/**
 * Checks a freshly-captured word against today's field bounty and, if it
 * completes it, awards the reward and fires a second notification. Never
 * blocks the capture flow — called fire-and-forget from captureWord.
 * @param {string} term
 * @param {string} themeId
 * @param {string} [pageUrl]
 */
export async function checkBounty(term, themeId, pageUrl) {
  const { justCompleted } = await recordBountyCapture({ term, themeId, pageUrl: pageUrl ?? '' })
  if (!justCompleted) return

  await awardBounty(themeId, BOUNTY_REWARD_XP)
  // Vault fragment trigger: every 3rd completed bounty (lifetime, across all
  // themes' bounty completions is not tracked separately — this is
  // per-theme, same as the redemption/streak-tier triggers in ReviewScreen).
  const progress = await getProgress(themeId)
  await recordBountyCompletion(themeId, progress)

  const bounty = getDailyBounty()
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/images/icon128.png',
    title: '★ Critical intel complete',
    message: `${bounty.directive} Reward filed: +${BOUNTY_REWARD_XP} XP, +1 streak shield.`,
  })
}

/**
 * Backfills a just-captured word's fact/example/etymology from the AI
 * Chronicle Engine, if enabled, without blocking capture. Silently no-ops
 * if the AI engine is off, unconfigured, or the request ultimately fails —
 * the word already exists with whatever curated content it had.
 * @param {number} wordId
 * @param {string} themeId
 * @param {string} term
 * @param {{needsFact: boolean, needsExample: boolean}} needs
 */
async function enrichWordWithAi(wordId, themeId, term, { needsFact, needsExample }) {
  const aiEnabled = await getSetting('aiEngineEnabled', false)
  if (!aiEnabled) return
  const apiKey = await getSetting('aiEngineApiKey', '')
  if (!apiKey) return
  const model = await getSetting('aiEngineModel', undefined)

  const patch = {}

  if (needsFact || needsExample) {
    const entry = await generateChronicleEntry(themeId, term, apiKey, model)
    if (entry) {
      if (needsFact) patch.fact = entry.chronicle_insight
      if (needsExample) {
        patch.exampleSentence = entry.sentence
        patch.exampleTranslation = entry.translation
      }
    }
  }

  const etymology = await generateEtymologyEntry(themeId, term, apiKey, model)
  if (etymology) patch.etymology = etymology

  if (Object.keys(patch).length > 0) await updateWord(wordId, patch)
}
