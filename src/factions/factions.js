/**
 * Static, per-theme "Factions & Ideologies" definitions. Where a Theme is a
 * language/era skin, a Faction is a philosophical/political current within
 * that era that the player builds standing with by correctly recalling
 * words tied to it — orthogonal to the SM-2 scheduling and XP/level system,
 * which stay theme-wide.
 * @typedef {Object} FactionDef
 * @property {string} factionId - unique slug, e.g. "jacobins"
 * @property {string} themeId
 * @property {string} name
 * @property {string} ideology - one-line description of the current
 * @property {string} emblem
 * @property {string[]} keywords - lowercased source-language terms that award
 *   this faction reputation when correctly recalled
 * @property {string[]} rankNames - reputation-tier labels, lowest first
 */

/** @type {FactionDef[]} */
export const FACTIONS = [
  {
    factionId: 'jacobins',
    themeId: 'french',
    name: 'The Jacobins',
    ideology: 'Radical republican virtue — the Revolution devours its own to stay pure.',
    emblem: '🔺',
    keywords: ['liberté', 'égalité', 'terreur', 'vertu', 'guillotine', 'tribunal', 'révolution', 'citoyen'],
    rankNames: ['Sympathizer', 'Sans-Culotte', 'Club Member', 'Deputy', "L'Incorruptible"],
  },
  {
    factionId: 'girondins',
    themeId: 'french',
    name: 'The Girondins',
    ideology: 'Federalist moderates — revolution through law, not the scaffold.',
    emblem: '⚖',
    keywords: ['loi', 'constitution', 'assemblée', 'député', 'nation', 'fédération'],
    rankNames: ['Sympathizer', 'Correspondent', 'Orator', 'Deputy', 'Elder Statesman'],
  },
  {
    factionId: 'stoics',
    themeId: 'italian',
    name: 'The Stoics',
    ideology: 'Discipline over passion — virtue is the only good, fortune is indifferent.',
    emblem: '◆',
    keywords: ['virtus', 'fatum', 'ratio', 'disciplina', 'imperium', 'honor', 'gloria'],
    rankNames: ['Novice', 'Student', 'Practitioner', 'Adept', 'Sage'],
  },
  {
    factionId: 'populares',
    themeId: 'italian',
    name: 'Populares',
    ideology: 'The people\'s faction — land reform and the tribunate against the old guard.',
    emblem: '🌾',
    keywords: ['plebs', 'tribunus', 'senatus', 'populus', 'lex', 'reforma'],
    rankNames: ['Plebeian', 'Voter', 'Agitator', 'Tribune', "People's Champion"],
  },
  {
    factionId: 'navigators',
    themeId: 'portuguese',
    name: 'The Navigators',
    ideology: 'Discovery as destiny — the sea is a ledger waiting to be filled.',
    emblem: '⚓',
    keywords: ['navio', 'mar', 'descoberta', 'rota', 'vento', 'bússola', 'porto'],
    rankNames: ['Grumete', 'Marinheiro', 'Piloto', 'Capitão', 'Almirante'],
  },
  {
    factionId: 'crown-merchants',
    themeId: 'portuguese',
    name: 'Crown & Merchants',
    ideology: 'Trade under the royal seal — profit as instrument of empire.',
    emblem: '👑',
    keywords: ['especiaria', 'comércio', 'coroa', 'feitoria', 'moeda', 'lucro'],
    rankNames: ['Clerk', 'Factor', 'Merchant', 'Royal Agent', 'Chancellor'],
  },
  {
    factionId: 'nomenklatura',
    themeId: 'russian',
    name: 'The Nomenklatura',
    ideology: 'The Party apparatus — order and loyalty above all else.',
    emblem: '☭',
    keywords: ['товарищ', 'партия', 'кремль', 'секретно', 'государство', 'приказ'],
    rankNames: ['Cadre', 'Clerk', 'Officer', 'Cipher Clerk', 'Secretary'],
  },
  {
    factionId: 'reformers',
    themeId: 'russian',
    name: 'The Reformers',
    ideology: "Gorbachev's children — openness and restructuring against the old order.",
    emblem: '🕊',
    keywords: ['гласность', 'перестройка', 'реформа', 'свобода', 'открытость'],
    rankNames: ['Sympathizer', 'Dissident', 'Organizer', 'Delegate', 'Architect'],
  },
]

/**
 * @param {string} themeId
 * @returns {FactionDef[]}
 */
export function getFactionsForTheme(themeId) {
  return FACTIONS.filter((f) => f.themeId === themeId)
}

/**
 * @param {string} factionId
 * @returns {FactionDef | undefined}
 */
export function getFactionDef(factionId) {
  return FACTIONS.find((f) => f.factionId === factionId)
}

/**
 * Finds every faction (within a theme) whose keyword list contains the
 * given term, so a single correctly-recalled word can feed multiple
 * factions if it's thematically loaded for more than one.
 * @param {string} themeId
 * @param {string} term
 * @returns {FactionDef[]}
 */
export function findFactionsForTerm(themeId, term) {
  const lower = term.trim().toLowerCase()
  return getFactionsForTheme(themeId).filter((f) => f.keywords.includes(lower))
}

/**
 * Picks the highest reputation-tier rank name reached so far.
 * @param {string[]} rankNames
 * @param {number} reputation
 * @returns {string}
 */
export function rankForReputation(rankNames, reputation) {
  const tierSize = 50
  const index = Math.min(rankNames.length - 1, Math.floor(reputation / tierSize))
  return rankNames[Math.max(0, index)]
}
