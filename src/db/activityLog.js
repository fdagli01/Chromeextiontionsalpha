/**
 * A lightweight cross-theme daily activity log, kept in chrome.storage.local
 * rather than IndexedDB — it's a rolling window (14 days) of simple counters,
 * not durable user data, so it doesn't warrant a schema migration. Powers
 * the weekly intel report (App.jsx) with real week-over-week numbers instead
 * of nothing.
 */
const STORAGE_KEY = 'polyglot-chronicle-activity-log'
const RETAIN_DAYS = 14
const SUMMARY_WINDOW_DAYS = 7
const TOP_MISSED_COUNT = 3

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

async function readLog() {
  const { [STORAGE_KEY]: log } = await chrome.storage.local.get(STORAGE_KEY)
  return log ?? {}
}

/**
 * Records one graded review into today's bucket, trimming any day older
 * than the retention window.
 * @param {string} term
 * @param {boolean} correct
 * @param {Date} [now]
 */
export async function logReviewActivity(term, correct, now = new Date()) {
  const log = await readLog()
  const today = dateKey(now)
  const day = log[today] ?? { reviewed: 0, correct: 0, missedTerms: {} }
  day.reviewed += 1
  if (correct) {
    day.correct += 1
  } else {
    day.missedTerms[term] = (day.missedTerms[term] ?? 0) + 1
  }
  log[today] = day

  const cutoff = dateKey(new Date(now.getTime() - RETAIN_DAYS * 24 * 60 * 60 * 1000))
  for (const key of Object.keys(log)) {
    if (key < cutoff) delete log[key]
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: log })
}

/**
 * Summarizes the trailing 7 days of activity: total reviewed, accuracy, and
 * the terms missed most often — the "usual suspects" for a weekly report.
 * @param {Date} [now]
 * @returns {Promise<{reviewed: number, correct: number, accuracyPct: number, topMissed: string[]}>}
 */
export async function getWeeklySummary(now = new Date()) {
  const log = await readLog()
  const cutoff = dateKey(new Date(now.getTime() - SUMMARY_WINDOW_DAYS * 24 * 60 * 60 * 1000))

  let reviewed = 0
  let correct = 0
  /** @type {Record<string, number>} */
  const missedCounts = {}

  for (const [day, stats] of Object.entries(log)) {
    if (day < cutoff) continue
    reviewed += stats.reviewed
    correct += stats.correct
    for (const [term, count] of Object.entries(stats.missedTerms ?? {})) {
      missedCounts[term] = (missedCounts[term] ?? 0) + count
    }
  }

  const topMissed = Object.entries(missedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_MISSED_COUNT)
    .map(([term]) => term)

  return {
    reviewed,
    correct,
    accuracyPct: reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0,
    topMissed,
  }
}
