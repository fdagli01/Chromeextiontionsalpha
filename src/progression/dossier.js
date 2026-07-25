import { getTheme } from '../themes/index.js'
import { getProgress } from '../db/progressRepo.js'
import { getAffinityRecordsForTheme } from '../db/affinityRepo.js'
import { getWordsByTheme } from '../db/wordsRepo.js'
import { masterySummary } from '../srs/mastery.js'
import { getEndingById } from './endings.js'
import { getDistinctionsForOtherThemes } from './distinctions.js'
import { rankForLevel } from '../xp/xp.js'
import { tierForTrust } from './affinity.js'
import { getPersonaById } from './mentors.js'
import { STORY_SCENES } from './storyScenes.js'
import { MEMENTOS } from './mementos.js'

/**
 * The dossier: everything the narrative layer has recorded about this
 * player, assembled for display. All of it already exists in the affinity
 * store and the decision journal — until now none of it was readable by
 * the person who lived it. This is the character sheet and the quest log
 * in one: who trusts you, what you chose when it counted, and exactly
 * what still stands between you and your ending.
 *
 * Pure derivation, no new storage.
 * @typedef {Object} DossierPersona
 * @property {string} personaId
 * @property {string} name
 * @property {string} [portrait]
 * @property {string} icon
 * @property {string} backstory
 * @property {number} trust
 * @property {{id: string, label: string}} tier
 * @property {{sceneId: string, title: string, tier: string, resolved: boolean, choiceLabel: string|null, response: string|null}[]} scenes
 * @property {{icon: string, name: string, flavor: string} | null} memento
 */

/**
 * @param {string} themeId
 * @returns {Promise<{
 *   rank: string, level: number, xp: number,
 *   personas: DossierPersona[],
 *   mastery: {gold: number, silver: number, bronze: number, total: number},
 *   distinctions: import('./distinctions.js').Distinction[],
 *   journal: {id: string, choiceId: string, at: string, label: string}[],
 *   ending: {claimed: boolean, earned: object|null, needsRank: string|null, scenesRemaining: number} }>}
 */
export async function getDossier(themeId) {
  const [progress, records, words, distinctions] = await Promise.all([
    getProgress(themeId),
    getAffinityRecordsForTheme(themeId),
    getWordsByTheme(themeId),
    // Earned in other eras — the only thing that crosses between them.
    getDistinctionsForOtherThemes(themeId),
  ])
  const theme = getTheme(themeId)
  const scenes = STORY_SCENES[themeId] ?? []
  const decisionsById = new Map(progress.decisions.map((d) => [d.id, d]))

  // One entry per persona that has either a scene chain or earned trust,
  // ordered by trust so the people closest to the player lead the file.
  const personaIds = [...new Set([...scenes.map((s) => s.personaId), ...records.map((r) => r.personaId)])]
  const personas = personaIds
    .map((personaId) => {
      const persona = getPersonaById(themeId, personaId)
      const record = records.find((r) => r.personaId === personaId)
      const trust = record?.trust ?? 0
      const memento = trust >= 50 ? (MEMENTOS[`${themeId}:${personaId}`] ?? null) : null
      return {
        personaId,
        name: persona?.name ?? personaId,
        portrait: persona?.portrait,
        icon: persona?.icon ?? '◆',
        backstory: persona?.backstory ?? '',
        trust,
        tier: tierForTrust(trust),
        memento,
        scenes: scenes
          .filter((s) => s.personaId === personaId)
          .map((scene) => {
            const decision = decisionsById.get(`scene:${scene.id}`)
            const choice = decision ? scene.choices.find((c) => c.id === decision.choiceId) : null
            return {
              sceneId: scene.id,
              title: scene.title,
              tier: scene.tier,
              resolved: !!decision,
              choiceLabel: choice?.label ?? null,
              response: choice?.response ?? null,
            }
          }),
      }
    })
    .sort((a, b) => b.trust - a.trust)

  // The journal in the order it happened, with a human label for the
  // handful of decisions that aren't scenes (the bribe, the black market).
  const sceneTitleById = new Map(scenes.map((s) => [`scene:${s.id}`, s.title]))
  const journal = [...progress.decisions]
    .sort((a, b) => (a.at < b.at ? -1 : 1))
    .map((d) => ({
      ...d,
      label:
        sceneTitleById.get(d.id) ??
        (d.id === 'french-bribe'
          ? d.choiceId === 'accepted'
            ? "You took the aristocrat's gold"
            : "You refused the aristocrat's gold"
          : d.id === 'contraband-sale'
            ? 'You fenced a banned word on the black market'
            : d.id === 'ending'
              ? 'Your file was closed'
              : d.id),
    }))

  const topRankLevel = theme?.rankNames?.length ?? 0
  const endingDecision = decisionsById.get('ending')
  const scenesRemaining = scenes.filter((s) => !decisionsById.has(`scene:${s.id}`)).length

  return {
    mastery: masterySummary(words),
    distinctions,
    rank: theme ? rankForLevel(theme.rankNames, progress.level) : `Level ${progress.level}`,
    level: progress.level,
    xp: progress.xp,
    personas,
    journal,
    ending: {
      claimed: !!endingDecision,
      // The epilogue itself, so a closed file can be re-read in full.
      earned: endingDecision ? getEndingById(endingDecision.choiceId) : null,
      needsRank:
        progress.level < topRankLevel && theme ? rankForLevel(theme.rankNames, topRankLevel) : null,
      scenesRemaining,
    },
  }
}
