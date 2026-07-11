import { getSetting } from '../db/settingsRepo.js'
import { getDueWords } from '../db/wordsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { getLastCrisisForTheme, logCrisisTriggered } from '../db/crisesRepo.js'
import { getTheme, DEFAULT_THEME_ID } from '../themes/index.js'
import { isUnlocked } from '../progression/unlocks.js'

export const CRISIS_ALARM_NAME = 'polyglot-chronicle-crisis-check'
const CHECK_INTERVAL_MINUTES = 30
const COOLDOWN_HOURS = 4

/** Registers the recurring alarm that opportunistically triggers a crisis. */
export function scheduleCrisisChecks() {
  chrome.alarms.create(CRISIS_ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES })
}

/**
 * Replaces the generic "N words due" nag with an in-world emergency: if the
 * active theme has enough overdue words to fill one of its crisis templates
 * and the cooldown since the last crisis has elapsed, picks one at random,
 * logs it, and notifies the user. A pending crisis already waiting to be
 * played blocks new ones from overwriting it.
 */
export async function checkForCrisis() {
  const themeId = (await getSetting('activeThemeId', DEFAULT_THEME_ID)) ?? DEFAULT_THEME_ID
  const theme = getTheme(themeId)
  if (!theme.crises || theme.crises.length === 0) return

  const progress = await getProgress(themeId)
  if (!isUnlocked('crises', progress.level)) return

  const { pendingCrisis } = await chrome.storage.local.get('pendingCrisis')
  if (pendingCrisis) return

  const last = await getLastCrisisForTheme(themeId)
  if (last) {
    const hoursSince = (Date.now() - new Date(last.triggeredAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince < COOLDOWN_HOURS) return
  }

  const dueWords = await getDueWords(themeId)
  const eligibleTemplates = theme.crises.filter((t) => dueWords.length >= t.wordCount)
  if (eligibleTemplates.length === 0) return

  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)]
  const record = await logCrisisTriggered(themeId, template.id)

  await chrome.storage.local.set({
    pendingCrisis: { themeId, templateId: template.id, crisisRecordId: record.id },
  })

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/images/icon128.png',
    title: template.headline,
    message: template.directive,
  })
}
