import { getSetting } from '../db/settingsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { getTheme, DEFAULT_THEME_ID } from '../themes/index.js'

export const STREAK_GUARD_ALARM_NAME = 'polyglot-chronicle-streak-guard'
const CHECK_INTERVAL_MINUTES = 60
/** Local hour (24h) after which an at-risk streak is worth nagging about. */
const EVENING_HOUR = 19

/** Registers the recurring alarm that checks whether tonight's streak is at risk. */
export function scheduleStreakGuardChecks() {
  chrome.alarms.create(STREAK_GUARD_ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES })
}

/**
 * Loss-aversion nudge: once per evening, if the active theme's streak is
 * still alive but today has had no review yet, fires a single notification
 * warning it's about to lapse at midnight. A `streakGuardWarnedDate` flag in
 * local storage caps this at one nudge per calendar day, however many times
 * the alarm fires after EVENING_HOUR.
 * @param {Date} [now]
 */
export async function checkStreakGuard(now = new Date()) {
  if (now.getHours() < EVENING_HOUR) return

  const themeId = (await getSetting('activeThemeId', DEFAULT_THEME_ID)) ?? DEFAULT_THEME_ID
  const theme = getTheme(themeId)
  const progress = await getProgress(themeId)
  if (progress.streak <= 0) return

  const today = now.toISOString().slice(0, 10)
  if (progress.lastActiveDate === today) return

  const { streakGuardWarnedDate } = await chrome.storage.local.get('streakGuardWarnedDate')
  if (streakGuardWarnedDate === today) return
  await chrome.storage.local.set({ streakGuardWarnedDate: today })

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/images/icon128.png',
    title: `🔥 ${progress.streak}-day streak ends tonight`,
    message: `Review a few ${theme.name} words before midnight to keep it alive.`,
  })
}
