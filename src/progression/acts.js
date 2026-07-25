import { getProgress, saveProgress } from '../db/progressRepo.js'

/**
 * Acts: the theme's own story, told in three beats as the player levels.
 * The visual `stages` already shift the palette at these thresholds, but
 * silently — the era changed and nobody said why. An act briefing is the
 * cold open for the new era: where history now stands, what changed for
 * the player's desk, and what the era wants from them.
 *
 * Level thresholds match the existing visual stage boundaries (4/8/14),
 * so a theme with stages changes its look and explains itself in the same
 * breath; the two themes without stages get the narrative beat anyway.
 * @typedef {Object} ActDef
 * @property {string} id
 * @property {number} minLevel
 * @property {string} dateline - in-world place and date
 * @property {string} title
 * @property {string} body
 * @property {string} standing - the era's standing order, one line
 */

/** @type {Record<string, ActDef[]>} lowest minLevel first */
export const ACTS = {
  russian: [
    {
      id: 'ru-act-1',
      minLevel: 4,
      dateline: 'MOSCOW · SECOND DIRECTORATE · 1979',
      title: 'YOU ARE GIVEN A DESK',
      body: 'The probation is over. They move you off the copying bench and give you a desk with a drawer that locks, which in this building is the same as a promotion and a warning. The intercepts you file now go upstairs with your initials on them. Somewhere above you, a man you will never meet reads them over breakfast and decides what the Union believes today.',
      standing: 'File cleanly. Initials are permanent.',
    },
    {
      id: 'ru-act-2',
      minLevel: 8,
      dateline: 'MOSCOW · SECOND DIRECTORATE · 1985',
      title: 'THE WORD FROM ABOVE CHANGES',
      body: 'Gласность arrives as a memo, which is how everything arrives here. Half the department treats it as a trap and keeps writing the old way; the other half writes what they actually think and watches the door. Your archive suddenly contains two incompatible truths about the same decade, both correctly filed, both signed by you.',
      standing: 'Both truths are on record. Decide which one you serve.',
    },
    {
      id: 'ru-act-3',
      minLevel: 14,
      dateline: 'MOSCOW · SECOND DIRECTORATE · 1991',
      title: 'THE BUILDING EMPTIES',
      body: 'Offices are cleared overnight without announcements. The shredders run until they overheat, then the burn barrels start in the courtyard. Nobody has told the archive what to do, which is itself an instruction, and you are one of very few people left who can read every file in it.',
      standing: 'What survives is what you choose to carry out.',
    },
  ],
  french: [
    {
      id: 'fr-act-1',
      minLevel: 4,
      dateline: 'PARIS · SECTION DU PANTHÉON · 1791',
      title: 'THE KING IS STILL KING',
      body: 'The Assembly writes a constitution and a monarch signs it, and everyone pretends this arrangement can hold. The section committee gives you a clerkship because you write a legible hand and ask few questions. The words in your ledgers — citoyen, nation, loi — are eight months old and already mean something different than when they were coined.',
      standing: 'Record the new words exactly. They are changing under you.',
    },
    {
      id: 'fr-act-2',
      minLevel: 8,
      dateline: 'PARIS · TRIBUNAL RÉVOLUTIONNAIRE · 1793',
      title: 'THE TERROR IS ADMINISTRATIVE',
      body: 'It turns out the Terror is mostly paperwork. Dockets, transfers, and correctly spelled names, produced by tired men at desks like yours. The scaffold is a rumor two streets away that arrives to you as a completed form. You have learned that a misspelling can be a mercy and that everyone in this building knows it.',
      standing: 'Every name you write down is a decision.',
    },
    {
      id: 'fr-act-3',
      minLevel: 14,
      dateline: 'PARIS · MINISTÈRE · 1799',
      title: 'A GENERAL LEARNS TO SPELL',
      body: 'The Revolution ends the way these things end: quietly, in an office, with a man in uniform explaining that order must be restored. The old vocabulary is retired by decree. Your archive is now the only place several republican words still exist in their original sense, which makes it either a museum or evidence.',
      standing: 'You are the last reader of the words as they were meant.',
    },
  ],
  italian: [
    {
      id: 'it-act-1',
      minLevel: 4,
      dateline: 'ROMA · TABULARIUM · AUC 707',
      title: 'THE REPUBLIC IS SHOUTING',
      body: 'The Senate argues about grain and means armies. You are moved from copying inventories to recording sessions, which means learning that the same Latin word carries one meaning in the curia and its exact opposite in the street outside. Both meanings are now your responsibility.',
      standing: 'Record what was said. The Senate will argue about what it meant.',
    },
    {
      id: 'it-act-2',
      minLevel: 8,
      dateline: 'ROMA · PALATINE ARCHIVES · AUC 727',
      title: 'ONE MAN, MANY TITLES',
      body: 'Nobody declares the Republic over. Instead the titles accumulate on one man until the arithmetic is obvious to everyone and stated by no one. Your archive receives a quiet instruction about which honorifics to use going forward, and the word res publica begins its long career as a formality.',
      standing: 'Use the new titles. Keep the old drafts.',
    },
    {
      id: 'it-act-3',
      minLevel: 14,
      dateline: 'ROMA · TABULARIUM · AUC 1160',
      title: 'THE FRONTIER COMES SOUTH',
      body: 'The frontier stops being a place on a map and becomes a season in the calendar. Latin fractures into the way people actually speak in Gaul, in Hispania, in Africa — and the archive, stubbornly, keeps recording the correct forms nobody uses. The correct forms will outlive the empire by a millennium. Nobody in this room knows that yet.',
      standing: 'Preserve the forms. They will outlast the borders.',
    },
  ],
  portuguese: [
    {
      id: 'pt-act-1',
      minLevel: 4,
      dateline: 'SAGRES · CASA DE CARTOGRAFIA · 1443',
      title: 'PAST THE CAPE OF FEAR',
      body: 'Cape Bojador was the edge of the known world until a captain sailed past it and came back bored. Now every ship returns with words no Portuguese dictionary has: currents, winds, fruits, a dozen names for kinds of rain. The archive was built for inventories and is now, without anyone deciding it, a dictionary of the world.',
      standing: 'Every returning ship brings vocabulary. Catch all of it.',
    },
    {
      id: 'pt-act-2',
      minLevel: 8,
      dateline: 'LISBOA · CASA DA ÍNDIA · 1502',
      title: 'THE ROUTE IS OPEN',
      body: 'The Cape route holds, and Lisbon becomes the loudest port in Europe. Pepper, silk, and eleven languages arrive on the same tide. Your ledgers now carry Malayalam, Arabic, and Swahili words in Portuguese spelling, filed by men who never heard them spoken correctly — and yours is the copy the Crown reads.',
      standing: 'Spell the borrowed words as they were actually said.',
    },
    {
      id: 'pt-act-3',
      minLevel: 14,
      dateline: 'LISBOA · CASA DA ÍNDIA · 1578',
      title: 'THE GOLDEN AGE ADMITS THE COST',
      body: 'The century that made the language global also spent a kingdom doing it. Camões writes the epic while dying poor. The archive holds both the triumphant roteiros and the crew lists that never came home, on the same shelf, in the same hand. Saudade turns out to be the only honest word for what the age produced.',
      standing: 'Keep the losses filed beside the discoveries.',
    },
  ],
  spanish: [
    {
      id: 'es-act-1',
      minLevel: 4,
      dateline: 'MADRID · MINISTERIO DE PROPAGANDA · JULIO 1936',
      title: 'THE GENERALS RISE',
      body: 'The garrison revolt was supposed to take three days. Three weeks later the country has two governments, two vocabularies, and a front line running through university buildings. You are handed a censor\'s desk because you can spell, and told that words are now materiel.',
      standing: 'Words are supplies now. Account for them.',
    },
    {
      id: 'es-act-2',
      minLevel: 8,
      dateline: 'MADRID · FRENTE DE LA CIUDAD UNIVERSITARIA · 1937',
      title: 'THE WORLD SENDS ITS POETS',
      body: 'The International Brigades arrive with rifles and dictionaries, and the trenches become the strangest language school in Europe: Catalan, Castilian, English, German, Polish, all improvising a shared vocabulary of exactly the words that keep people alive. Your archive is filling with slang that will not survive the war.',
      standing: 'Record the trench vocabulary. Nobody else will.',
    },
    {
      id: 'es-act-3',
      minLevel: 14,
      dateline: 'FRONTERA FRANCESA · FEBRERO 1939',
      title: 'LA RETIRADA',
      body: 'The border road north is a column of half a million people carrying whatever fits: a child, a photograph, a language. What you filed is going out in coat linings and suitcases, and the words that stay behind will be officially corrected for forty years. The archive is now wherever the people carrying it stop walking.',
      standing: 'What crosses the border with you is the archive now.',
    },
  ],
}

/**
 * The act briefing owed to the player, or null. Returned when the level
 * has reached an act the player has not been shown yet — earlier acts
 * first, so a player who levels several times at once still gets them in
 * order rather than skipping the story.
 * @param {string} themeId
 * @returns {Promise<ActDef | null>}
 */
export async function getPendingAct(themeId) {
  const acts = ACTS[themeId]
  if (!acts) return null
  const progress = await getProgress(themeId)
  const seen = new Set(progress.actsSeen)
  return acts.find((act) => progress.level >= act.minLevel && !seen.has(act.id)) ?? null
}

/**
 * @param {string} themeId
 * @param {string} actId
 * @returns {Promise<import('../db/progressRepo.js').ThemeProgress>}
 */
export async function markActSeen(themeId, actId) {
  const progress = await getProgress(themeId)
  if (progress.actsSeen.includes(actId)) return progress
  return saveProgress(themeId, { actsSeen: [...progress.actsSeen, actId] })
}
