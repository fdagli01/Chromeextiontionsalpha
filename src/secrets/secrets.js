/**
 * Curated "secret" cultural anecdotes — a handful of especially rich words
 * per theme that, the first time correctly recalled, reveal a one-time
 * deep-dive fact beyond the normal fact/philosophy/etymology fields.
 * Deliberately rare and hand-picked rather than exhaustive, so discovering
 * one feels like an easter egg rather than routine content.
 * @typedef {Object} SecretDef
 * @property {string} themeId
 * @property {string} term - lowercased source-language term this secret is keyed to
 * @property {string} title
 * @property {string} icon
 * @property {string} anecdote
 */

/** @type {SecretDef[]} */
export const SECRETS = [
  {
    themeId: 'russian',
    term: 'спутник',
    title: 'The Sputnik Moment',
    icon: '🛰',
    anecdote:
      "Sputnik's launch in October 1957 triggered genuine panic in the United States — Americans could see it cross the night sky with binoculars. Within a year Congress created NASA and DARPA, and the U.S. overhauled its science education system, all chasing a beeping 58cm metal sphere.",
  },
  {
    themeId: 'russian',
    term: 'кремль',
    title: 'Kremlinology',
    icon: '🔬',
    anecdote:
      "Since the USSR published almost nothing about its internal politics, Western analysts invented \"Kremlinology\": studying who stood where on Lenin's Mausoleum during parades, whose photo appeared in what order in Pravda, to guess who was rising or falling from power.",
  },
  {
    themeId: 'russian',
    term: 'товарищ',
    title: 'A Word in Exile',
    icon: '☭',
    anecdote:
      'After 1991, "товарищ" (comrade) fell out of official use almost overnight — the post-Soviet government preferred the pre-revolutionary "господин" (sir/mister). Today the old word survives mostly in the army, and ironically, among nostalgics.',
  },
  {
    themeId: 'italian',
    term: 'colosseo',
    title: 'The Machine Beneath the Arena',
    icon: '⚙',
    anecdote:
      'Beneath the Colosseum\'s sand floor was the hypogeum — a two-story network of tunnels, cages, and 28 wooden elevators, worked entirely by hand-cranked pulleys, that could launch a full-grown lion into the arena in seconds through a trapdoor.',
  },
  {
    themeId: 'italian',
    term: 'aquila',
    title: 'The Eagle Must Return',
    icon: '🦅',
    anecdote:
      "Losing a legion's aquila to an enemy was such a disgrace that Rome would sometimes disband the legion entirely rather than let it fight on without one. When the Parthians captured three eagles in 53 BC, Augustus spent over 30 years on diplomacy alone to win them back — no war needed.",
  },
  {
    themeId: 'italian',
    term: 'senato',
    title: 'The Room Still Stands',
    icon: '🏛',
    anecdote:
      "The Curia Julia — the Senate's meeting hall built by Julius Caesar — still stands almost intact in the Roman Forum today, largely because it was converted into a church in the 7th century instead of being demolished for building stone like most of ancient Rome.",
  },
  {
    themeId: 'french',
    term: 'guillotine',
    title: "The Doctor's Regret",
    icon: '⚔',
    anecdote:
      'Dr. Joseph-Ignace Guillotin actually opposed capital punishment and proposed the device as a more humane, equal alternative — nobles were beheaded by sword while commoners were hanged, often botched. Mortified that his name became attached to the machine, his family later petitioned, unsuccessfully, to change their surname.',
  },
  {
    themeId: 'french',
    term: 'terreur',
    title: 'The Law That Ate Itself',
    icon: '⚖',
    anecdote:
      "The Law of 22 Prairial (June 1794) stripped defendants of the right to counsel and witnesses, causing executions to spike sharply — in the six weeks before Robespierre's own fall, more people were guillotined in Paris than in the previous fourteen months combined.",
  },
  {
    themeId: 'french',
    term: 'la gauche',
    title: 'A Seat Becomes a Slur',
    icon: '🪑',
    anecdote:
      '"Gauche" simply meant "left" from where deputies sat in the 1789 Assembly — but the word also drifted into English, where it now means socially awkward or tactless, an entirely unrelated meaning inherited from old suspicion of left-handedness.',
  },
  {
    themeId: 'portuguese',
    term: 'saudade',
    title: 'A National Holiday for a Feeling',
    icon: '🕯',
    anecdote:
      'Brazil officially celebrates "Dia da Saudade" (Day of Saudade) every January 30th — a rare case of an entire nation dedicating a holiday to a single untranslatable emotion.',
  },
  {
    themeId: 'portuguese',
    term: 'especiarias',
    title: 'Pepper as Currency',
    icon: '💰',
    anecdote:
      'Pepper was so valuable that it functioned as real currency in medieval Europe — rents, dowries, and even ransoms were sometimes paid in peppercorns. The English legal phrase "peppercorn rent" (a symbolic, near-worthless payment) is a fossil of just how much that value later collapsed.',
  },
  {
    themeId: 'portuguese',
    term: 'astrolábio',
    title: 'Lost and Found at Sea',
    icon: '⚓',
    anecdote:
      "In 2014, marine archaeologists recovered a bronze disc from a Portuguese shipwreck off the coast of Oman, sunk in 1503. Faint engravings later confirmed it as the oldest known mariner's astrolabe — a single object bridging a five-century gap in navigational history.",
  },
  {
    themeId: 'spanish',
    term: 'no pasarán',
    title: 'A Slogan Outlives the War',
    icon: '✊',
    anecdote:
      'Dolores Ibárruri delivered "¡No pasarán!" in a radio address in July 1936, days after the war began. Madrid did fall in 1939 — but the phrase itself never died: it resurfaced in anti-fascist and pro-democracy movements from Mexico to France for the rest of the century.',
  },
  {
    themeId: 'spanish',
    term: 'bombardeo',
    title: 'A Painting as a Witness Statement',
    icon: '🎨',
    anecdote:
      "Picasso, then living in Paris, read newspaper reports of the Guernica bombing and finished a 3.5-by-7.7-meter mural in under a month. He refused to let it hang in Spain while Franco lived — it only arrived in Madrid in 1981, six years after Franco's death.",
  },
  {
    themeId: 'spanish',
    term: 'exilio',
    title: 'A Library That Crossed the Ocean',
    icon: '📚',
    anecdote:
      'Mexico\'s government under Lázaro Cárdenas accepted tens of thousands of Republican exiles after 1939 — among them publishers, professors, and scientists who founded institutions like Mexico\'s Casa de España, reshaping Mexican academic life for generations.',
  },
]

/**
 * @param {string} themeId
 * @param {string} term
 * @returns {SecretDef | undefined}
 */
export function findSecretForTerm(themeId, term) {
  const lower = term.trim().toLowerCase()
  return SECRETS.find((s) => s.themeId === themeId && s.term === lower)
}

/**
 * @param {string} themeId
 * @returns {SecretDef[]}
 */
export function getSecretsForTheme(themeId) {
  return SECRETS.filter((s) => s.themeId === themeId)
}
