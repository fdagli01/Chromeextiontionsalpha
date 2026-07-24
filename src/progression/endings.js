import { getTheme } from '../themes/index.js'
import { getFactionsForTheme } from '../factions/factions.js'
import { getFactionProgress } from '../db/factionsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { getDecision, recordDecision } from './decisions.js'
import { STORY_SCENES } from './storyScenes.js'

/**
 * Endings: the payoff for finishing a theme's full arc. Earning one
 * requires BOTH kinds of investment the game asks for — the RPG
 * (every persona's Warm and Ally scene resolved: real relationships,
 * genuinely built) and the SRS (the theme's top rank, which only comes
 * from sustained, real recall). A theme with no faction pair (none
 * currently) falls back to a single epilogue.
 * @typedef {Object} EndingDef
 * @property {string} id - "themeId:variantId"
 * @property {string} rankTitle - the final rank the epilogue addresses the player by
 * @property {string} title
 * @property {string} body
 */

/** @type {Record<string, {factionAId: string, high: EndingDef, low: EndingDef, balanced: EndingDef}>} */
const ENDING_SETS = {
  russian: {
    factionAId: 'nomenklatura',
    high: {
      id: 'russian:apparatus',
      title: 'GENERAL SECRETARY',
      body: 'The office is yours, finally, after every clerk who outlasted you retired or vanished. The Handler salutes with something almost like irony. The Defector\'s last postcard sits in your desk, unanswered by policy and by choice. You kept the Party\'s language flawless for so long that you forgot to ask what it was for. The archive remembers everything. It does not, however, forgive.',
    },
    low: {
      id: 'russian:crossing',
      title: 'THE ONE WHO WENT WEST',
      body: 'You take the seat the Defector once offered — years late, and no one is surprised. The border guard barely glances at the papers you filed so carefully for decades; irony, filed under EXIT. Somewhere the Handler is burning a file with your name spelled correctly, one last professional courtesy. The words you spent your life archiving cross with you. They were always the point.',
    },
    balanced: {
      id: 'russian:archivist',
      title: 'THE KEEPER',
      body: 'You never chose a side cleanly enough to be trusted by either — which, in this building, is its own kind of survival. The unmarked file, the annotated manifesto, the cracked seal: all of it sits in an archive only you can fully read. History will ask a historian to reconcile it. You already know it cannot be reconciled. You file it anyway. That was always the job.',
    },
  },
  french: {
    factionAId: 'jacobins',
    high: {
      id: 'french:incorruptible',
      title: "L'INCORRUPTIBLE",
      body: 'Your record is spotless, your convictions cited in tribunals that no longer need your name to know your handwriting. The Aristocrate\'s fourteen words and the Sans-Culotte\'s first sentence sit in the same archive, filed under a Revolution that consumed nearly everyone who built it. You are, improbably, still standing. You keep the docket. The docket, this once, has run out of names.',
    },
    low: {
      id: 'french:girondin',
      title: 'THE LEGALIST',
      body: 'You spent the Terror keeping the law honest one misspelled name at a time, and the law — for once, for you — returns the favor. Laforge\'s corrected indictment and the Pamphlétaire\'s errata sit bound together in your final report, the truest document either faction ever produced. The Revolution eventually forgives careful clerks. Eventually is the whole trick.',
    },
    balanced: {
      id: 'french:witness',
      title: 'THE RECORD KEEPER',
      body: 'You served no faction long enough to be claimed by one, which the surviving factions both call cowardice and the dead, if asked, would call mercy. The bribe you took or refused, the letter you rewrote or didn\'t — all of it is filed, dated, true. Someone will read this archive in a calmer century and understand the Revolution better than anyone who lived only one side of it. That someone is why you kept writing.',
    },
  },
  italian: {
    factionAId: 'stoics',
    high: {
      id: 'italian:sage',
      title: 'THE SAGE',
      body: 'Discipline outlasted every passion it was built to survive. The Centurio\'s letter, delivered; the Oracle\'s last laurel, kept; the Gladiator\'s rudis, earned honestly. You leave the archive the way a Stoic leaves anything: without drama, having already done the only thing that mattered. Virtus is the only good. You spent a career proving you understood the sentence, not just the word.',
    },
    low: {
      id: 'italian:tribune',
      title: "THE PEOPLE'S CHAMPION",
      body: 'The Senator\'s empty seat, the boy who learned to read, the sand the Gladiator kept — your archive tilts, unmistakably, toward the plebs and away from the marble. Populares quote your files in the forum now. Somewhere the Stoics call this vulgar. You have decided vulgar is an acceptable price for useful.',
    },
    balanced: {
      id: 'italian:archivist',
      title: 'ARCHIVIST OF THE REPUBLIC',
      body: 'You served Rome, which is a larger and stranger loyalty than either faction claiming to embody it. The chiseled level-ups, the marble sheen, the SPQR watermark you never once needed explained — all of it is a career spent proving that discipline and the people were never actually opposites, just two words that stopped listening to each other. Your archive is the one place they still do.',
    },
  },
  portuguese: {
    factionAId: 'navigators',
    high: {
      id: 'portuguese:almirante',
      title: 'ALMIRANTE',
      body: 'The rank the Navigators reserve for exactly one kind of person: someone who kept the charts honest even when honesty cost the Crown money. Henrique\'s navigation school bears a plaque with your name below his. The blank east edge of the Cartographer\'s master chart is a little less blank now — you filled it with a route, not a monster. The sea, magnificently impartial, approves.',
    },
    low: {
      id: 'portuguese:chancellor',
      title: 'CHANCELLOR',
      body: 'Crown and Merchants remember exactly who kept the manifests generous and the dictionaries useful for contracts. It paid well; it always does. The Stowaway still visits, orange in hand, calling you "officially somebody" with a smile that has never fully forgiven the arithmetic. You tell yourself the Empire needed honest accountants too. Some nights you believe it.',
    },
    balanced: {
      id: 'portuguese:cronista',
      title: 'THE CHRONICLER',
      body: 'You never fully joined the ledger or the compass, which means both trust you exactly as much as they trust anyone who kept receipts. Saudade, it turns out, is not only for the sea — it is also for the version of the Empire that could have been honest at every latitude. You wrote down the one you got instead. That is worth almost as much.',
    },
  },
  spanish: {
    factionAId: 'republicanos',
    high: {
      id: 'spanish:comisario',
      title: 'COMISARIO',
      body: 'Frente Popular claims you as one of its own — the desk that never once slowed the front\'s dispatches, the ledger that carried La Miliciana\'s name and forty others past a border that closed on schedule anyway. No pasarán is still legible on one surviving brick. You made sure of it. History does not always reward the side that keeps its receipts. This time, barely, it does.',
    },
    low: {
      id: 'spanish:testigo',
      title: 'TESTIGO',
      body: 'Los Exiliados carry your name in the coat lining alongside El Abuelo\'s list of forty-one — a witness who crossed when the witnessing mattered more than the winning. The Correspondent\'s last wire out ran through your desk. So did most of the truths no one wanted filed. You are read, in Toulouse kitchens, once a year, on the anniversary no one has to name aloud.',
    },
    balanced: {
      id: 'spanish:cronista',
      title: 'EL CRONISTA',
      body: 'You kept both sides\' words honest longer than the war let anyone keep anything, and when it ended neither faction fully claimed you and neither fully disowned you. The Censor\'s EXCEPTIONS folder and the wall at the crossroads are both, in their way, yours. Someone will need this archive to understand how ordinary people survived an extraordinary war. That is the only rank that ever mattered.',
    },
  },
}

/** @returns {string[]} all "scene:<id>" decision ids for a theme's full arc. */
function fullArcDecisionIds(themeId) {
  return (STORY_SCENES[themeId] ?? []).map((s) => `scene:${s.id}`)
}

/**
 * Whether every Warm+Ally scene in a theme has been resolved (any choice
 * counts — this gate is about relationships built, not which way they went).
 * @param {string} themeId
 * @param {Array<{id: string}>} decisions
 * @returns {boolean}
 */
function hasCompletedFullArc(themeId, decisions) {
  const journaled = new Set(decisions.map((d) => d.id))
  return fullArcDecisionIds(themeId).every((id) => journaled.has(id))
}

/**
 * The ending owed to the player, or null if not yet earned or already
 * claimed. Earning requires the theme's top rank (sustained SRS recall)
 * AND every persona's full Warm+Ally arc resolved (sustained RPG
 * investment) — the two halves of the game meeting at the finish line.
 * @param {string} themeId
 * @returns {Promise<EndingDef | null>}
 */
export async function getPendingEnding(themeId) {
  const set = ENDING_SETS[themeId]
  const theme = getTheme(themeId)
  if (!set || !theme) return null

  const alreadyClaimed = await getDecision(themeId, 'ending')
  if (alreadyClaimed) return null

  const progress = await getProgress(themeId)
  const topRankLevel = theme.rankNames.length
  if (progress.level < topRankLevel) return null
  if (!hasCompletedFullArc(themeId, progress.decisions)) return null

  const factions = getFactionsForTheme(themeId)
  const factionA = factions.find((f) => f.factionId === set.factionAId)
  const factionB = factions.find((f) => f.factionId !== set.factionAId)
  if (!factionA || !factionB) return set.balanced

  const [repA, repB] = await Promise.all([
    getFactionProgress(factionA.factionId, themeId),
    getFactionProgress(factionB.factionId, themeId),
  ])
  const diff = repA.reputation - repB.reputation
  if (Math.abs(diff) < 15) return set.balanced
  return diff > 0 ? set.high : set.low
}

/**
 * Looks up an ending by the id stored in the decision journal, so a
 * finished file can be re-read rather than being a one-time event the
 * player half-remembers.
 * @param {string} endingId - "themeId:variantId"
 * @returns {EndingDef | null}
 */
export function getEndingById(endingId) {
  for (const set of Object.values(ENDING_SETS)) {
    for (const variant of [set.high, set.low, set.balanced]) {
      if (variant.id === endingId) return variant
    }
  }
  return null
}

/**
 * Marks the ending as claimed — permanent, one per theme, journaled like
 * any other decision so it survives a rebuilt getPendingEnding check.
 * @param {string} themeId
 * @param {EndingDef} ending
 * @returns {Promise<void>}
 */
export async function claimEnding(themeId, ending) {
  await recordDecision(themeId, 'ending', ending.id)
}
