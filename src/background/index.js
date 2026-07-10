import { addWord, getSetting } from '../db/index.js'
import { getTheme, listThemes } from '../themes/index.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'
import { generateChronicleEntry } from '../facts/aiEngine.js'
import { generateEtymologyEntry } from '../facts/etymologyEngine.js'
import { translateToEnglish } from './translate.js'
import { checkForCrisis, CRISIS_ALARM_NAME, scheduleCrisisChecks } from './crisisScheduler.js'

const MENU_ROOT_ID = 'polyglot-chronicle-root'

/** @param {string} themeId */
function menuIdForTheme(themeId) {
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

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CRISIS_ALARM_NAME) checkForCrisis()
})

chrome.contextMenus.onClicked.addListener((info) => {
  const theme = listThemes().find((t) => menuIdForTheme(t.id) === info.menuItemId)
  if (!theme) return
  const term = info.selectionText?.trim()
  if (term) captureWord(term, theme.id)
})

/**
 * Captures a selected word into the chosen theme's archive: fetches an
 * English translation, attaches any curated historical trivia, persists it,
 * and confirms with a themed notification. Translation failures don't block
 * the capture — the word is still saved so nothing is lost.
 *
 * When the term has no curated fact/example (or etymology), and the user
 * has the AI Chronicle Engine enabled with an API key, this falls back to
 * Gemini for that one word before saving — a single-word request, so the
 * per-minute quota isn't a concern the way a bulk backfill is.
 * @param {string} term
 * @param {string} themeId
 */
async function captureWord(term, themeId) {
  const theme = getTheme(themeId)

  const translation = await translateToEnglish(term, theme.sourceLanguageCode)
  let fact = getFact(themeId, term)
  const transliteration = getTransliteration(themeId, term)
  let example = getExample(themeId, term)
  const philosophy = getPhilosophy(themeId, term)
  let etymology

  const aiEnabled = await getSetting('aiEngineEnabled', false)
  const apiKey = aiEnabled ? await getSetting('aiEngineApiKey', '') : ''
  if (apiKey) {
    const model = await getSetting('aiEngineModel', undefined)

    if (!fact || !example) {
      const entry = await generateChronicleEntry(themeId, term, apiKey, model)
      if (entry) {
        if (!fact) fact = entry.chronicle_insight
        if (!example) example = { sentence: entry.sentence, translation: entry.translation }
      }
    }

    etymology = (await generateEtymologyEntry(themeId, term, apiKey, model)) ?? undefined
  }

  const word = await addWord({
    themeId,
    term,
    translation,
    fact,
    transliteration,
    exampleSentence: example?.sentence ?? '',
    exampleTranslation: example?.translation ?? '',
    philosophyNote: philosophy,
    etymology,
  })

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/images/icon128.png',
    title: `Filed — ${theme.name}`,
    message: translation ? `${word.term} — ${translation}` : word.term,
  })
}
