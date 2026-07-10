/**
 * Curated, pre-authored content for the Italian/Roman theme, keyed by the
 * lowercased term. Mirrors russian.js's shape: fact + example sentence +
 * optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const ITALIAN_ENTRIES = {
  'senato': {
    fact: 'The Roman Senate was an advisory council of noble families that shaped state policy from the 8th century BC onward.',
    example: 'Il Senato si riuniva per discutere le leggi.',
    exampleTranslation: 'The Senate convened to debate the laws.',
    philosophy: "Cicero's concept of res publica (\"the public thing\") argues the state should be the product of shared deliberation, not one man's will — the Senate institutionalized that ideal.",
  },
  'legione': {
    fact: 'A Roman legion numbered roughly 5,000 soldiers; each carried its own eagle standard (aquila), and losing it was a profound disgrace.',
    example: 'La legione marciò per tre giorni.',
    exampleTranslation: 'The legion marched for three days.',
  },
  'console': {
    fact: 'During the Republic, the two consuls who headed the state were elected together for one year specifically to check each other.',
    example: 'I due consoli governavano insieme per un anno.',
    exampleTranslation: 'The two consuls governed together for a year.',
  },
  'gladiatore': {
    fact: 'Most gladiators were slaves or prisoners of war; some could win their freedom (rudis) through victory.',
    example: 'Il gladiatore combatté coraggiosamente nell\'arena.',
    exampleTranslation: 'The gladiator fought bravely in the arena.',
    philosophy: "Seneca writes in his letters that watching gladiatorial combat coarsens the soul — Stoic composure in the face of death stands in stark contrast to death staged as mass entertainment in the arena.",
  },
  'imperatore': {
    fact: '"Imperator" originally meant simply "supreme commander"; with Augustus it became a permanent title.',
    example: "L'imperatore governava su tutto l'impero.",
    exampleTranslation: 'The emperor ruled over the entire empire.',
    philosophy: "In The Prince, Machiavelli praises Augustus's ability to establish one-man rule in practice while preserving a republican facade as a model of virtù (political mastery).",
  },
  'aquila': {
    fact: 'The eagle was the sacred standard (signum) of the Roman legions; Marius\'s reforms in 104 BC made it the official emblem of every legion.',
    example: "L'aquila era il simbolo della legione.",
    exampleTranslation: 'The eagle was the symbol of the legion.',
  },
  'colosseo': {
    fact: 'Opened in AD 80, the Colosseum was the largest amphitheater of the ancient world, holding over 50,000 spectators at once.',
    example: 'Migliaia di persone si riunivano al Colosseo.',
    exampleTranslation: 'Thousands would gather at the Colosseum.',
  },
  'impero': {
    fact: 'The Roman Empire reached its greatest extent in AD 117, under Emperor Trajan.',
    example: 'L\'impero si estendeva su tre continenti.',
    exampleTranslation: 'The empire spanned three continents.',
    philosophy: "Polybius's theory of \"the cycle of constitutions\" (anacyclosis) reads Rome's evolution from Kingdom to Republic to Empire as a cycle in which every form of government inevitably degenerates into the next.",
  },
  'cittadino': {
    fact: 'Roman citizenship (civitas) originally belonged only to those born in Rome; in AD 212 Caracalla extended it to every free man in the empire.',
    example: 'Ogni cittadino aveva doveri verso lo stato.',
    exampleTranslation: 'Every citizen had duties to the state.',
    philosophy: "Aristotle's thesis in the Politics that \"man is by nature a political animal\" (zoon politikon) explains why Roman citizenship was considered a moral identity, not merely a legal one.",
  },
  'centurione': {
    fact: 'A centurio commanded a unit of roughly 80 soldiers (a centuria), carrying the legion\'s discipline and combat experience on his shoulders.',
    example: 'Il centurione comandava ottanta soldati.',
    exampleTranslation: 'The centurion commanded eighty soldiers.',
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getItalianFact(term) {
  return ITALIAN_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getItalianExample(term) {
  const entry = ITALIAN_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getItalianPhilosophy(term) {
  return ITALIAN_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
