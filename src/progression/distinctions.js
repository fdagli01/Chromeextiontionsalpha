import { getProgress } from '../db/progressRepo.js'
import { listThemes } from '../themes/index.js'
import { getEndingById } from './endings.js'

/**
 * Distinctions: the only thing in this app that crosses eras.
 *
 * Everything else — words, XP, rank, trust, factions, the story — is
 * deliberately scoped to a single theme, so each era is its own clean
 * run. That isolation has one cost: a player who finishes an era arrives
 * at an ending and then has no reason to believe a second era is worth
 * starting, because nothing they earned travels with them.
 *
 * A distinction is what travels. Closing a theme's file mints one, and it
 * is then visible in every OTHER theme's dossier: proof carried into the
 * new archive that this clerk has finished somewhere before. It grants no
 * mechanical advantage on purpose — an era that could be shortened by a
 * previous era's XP would stop being a clean run.
 *
 * Pure derivation from the decision journals; no new storage.
 * @typedef {Object} Distinction
 * @property {string} themeId
 * @property {string} themeName
 * @property {string} emblem
 * @property {string} endingTitle - the epilogue actually earned
 * @property {string} at - ISO timestamp the file was closed
 */

/**
 * Every era this player has closed the file on, oldest first.
 * @returns {Promise<Distinction[]>}
 */
export async function getDistinctions() {
  const themes = listThemes()
  const progresses = await Promise.all(themes.map((t) => getProgress(t.id)))

  const earned = []
  themes.forEach((theme, i) => {
    const ending = progresses[i].decisions.find((d) => d.id === 'ending')
    if (!ending) return
    earned.push({
      themeId: theme.id,
      themeName: theme.terminalName,
      emblem: theme.emblem,
      endingTitle: getEndingById(ending.choiceId)?.title ?? '',
      at: ending.at,
    })
  })
  return earned.sort((a, b) => (a.at < b.at ? -1 : 1))
}

/**
 * The distinctions worth showing inside a given era: the other eras'
 * only. A theme's own ending is already the headline of its dossier, so
 * repeating it as a distinction there would be noise.
 * @param {string} themeId
 * @returns {Promise<Distinction[]>}
 */
export async function getDistinctionsForOtherThemes(themeId) {
  return (await getDistinctions()).filter((d) => d.themeId !== themeId)
}

/**
 * The next era to suggest to a player who has just finished one: the
 * least-advanced era they have not closed. Ranked by how little they have
 * done there, so the invitation is genuinely a fresh start rather than a
 * half-played file they abandoned.
 * @param {string} themeId - the era just finished
 * @returns {Promise<{themeId: string, themeName: string, emblem: string, era: string} | null>}
 */
export async function suggestNextEra(themeId) {
  const themes = listThemes()
  const progresses = await Promise.all(themes.map((t) => getProgress(t.id)))

  const candidates = themes
    .map((theme, i) => ({ theme, progress: progresses[i] }))
    .filter(({ theme, progress }) => theme.id !== themeId && !progress.decisions.some((d) => d.id === 'ending'))
    .sort((a, b) => a.progress.lifetimeReviews - b.progress.lifetimeReviews)

  if (candidates.length === 0) return null
  const { theme } = candidates[0]
  return { themeId: theme.id, themeName: theme.terminalName, emblem: theme.emblem, era: theme.era }
}
