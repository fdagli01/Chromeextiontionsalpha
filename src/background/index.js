import { addWord, getSetting } from '../db/index.js'
import { getTheme, DEFAULT_THEME_ID } from '../themes/index.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'
import { translateToEnglish } from './translate.js'
import { checkForCrisis, CRISIS_ALARM_NAME, scheduleCrisisChecks } from './crisisScheduler.js'

const ADD_WORD_MENU_ID = 'polyglot-chronicle-add-word'

/**
 * (Re)creates the right-click "add word" menu item using the active theme's
 * own flavor text (e.g. "Decrypt intercept" for Russian, "File before the
 * tribunal" for French), so the context menu reads in-world rather than as a
 * generic browser affordance. Safe to call repeatedly.
 */
async function rebuildContextMenu() {
  const themeId = (await getSetting('activeThemeId', DEFAULT_THEME_ID)) ?? DEFAULT_THEME_ID
  const theme = getTheme(themeId)
  await chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: ADD_WORD_MENU_ID,
    title: theme.contextMenuTitle,
    contexts: ['selection'],
  })
}

chrome.runtime.onInstalled.addListener(rebuildContextMenu)
chrome.runtime.onStartup.addListener(rebuildContextMenu)

chrome.runtime.onInstalled.addListener(scheduleCrisisChecks)
chrome.runtime.onStartup.addListener(scheduleCrisisChecks)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CRISIS_ALARM_NAME) checkForCrisis()
})

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'themeChanged') rebuildContextMenu()
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== ADD_WORD_MENU_ID) return
  const term = info.selectionText?.trim()
  if (term) captureWord(term)
})

/**
 * Captures a selected word into the active theme's archive: fetches an
 * English translation, attaches any curated historical trivia, persists it,
 * and confirms with a themed notification. Translation failures don't block
 * the capture — the word is still saved so nothing is lost.
 * @param {string} term
 */
async function captureWord(term) {
  const themeId = (await getSetting('activeThemeId', DEFAULT_THEME_ID)) ?? DEFAULT_THEME_ID
  const theme = getTheme(themeId)

  const translation = await translateToEnglish(term, theme.sourceLanguageCode)
  const fact = getFact(themeId, term)
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
    title: 'Filed',
    message: translation ? `${word.term} — ${translation}` : word.term,
  })
}
