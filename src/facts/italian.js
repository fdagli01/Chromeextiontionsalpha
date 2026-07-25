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
  'patrizio': {
    fact: 'Patrician families claimed descent from Rome\'s founding senators; for centuries only patricians could hold priesthoods and the highest magistracies, until plebeian pressure forced those offices open.',
    example: 'Il patrizio apparteneva a una famiglia antica.',
    exampleTranslation: 'The patrician belonged to an ancient family.',
  },
  'plebe': {
    fact: 'The plebeians — everyone outside the patrician families — twice seceded from the city entirely (the secessio plebis) to force political concessions, inventing one of history\'s earliest recorded general strikes.',
    example: 'La plebe chiedeva più diritti politici.',
    exampleTranslation: 'The plebeians demanded more political rights.',
    philosophy: 'The Struggle of the Orders reads as an early precedent for what later republican theory calls "mixed government" — Polybius argued Rome\'s stability came precisely from patrician and plebeian power checking each other.',
  },
  'foro': {
    fact: 'The Roman Forum was the civic heart of the city — courts, temples, markets, and political speeches all shared the same open square for a thousand years.',
    example: 'Il Foro era il centro della vita pubblica.',
    exampleTranslation: 'The Forum was the center of public life.',
  },
  'toga': {
    fact: 'Only Roman citizens were legally permitted to wear the toga; a candidate for office wore a specially whitened version called the toga candida — the origin of the word "candidate".',
    example: 'Indossava la toga per l\'occasione ufficiale.',
    exampleTranslation: 'He wore the toga for the official occasion.',
  },
  'tribuno': {
    fact: 'The Tribune of the Plebs held a unique power: sacrosanctity meant harming one was a capital offense, and a single tribune\'s veto could halt any act of the Senate.',
    example: 'Il tribuno difendeva gli interessi del popolo.',
    exampleTranslation: 'The tribune defended the people\'s interests.',
  },
  'legato': {
    fact: 'A legatus was a senator delegated to command a legion or govern a province on the emperor\'s behalf — the origin of the modern word "legate" for a papal or diplomatic envoy.',
    example: 'Il legato guidava le truppe in battaglia.',
    exampleTranslation: 'The legate led the troops into battle.',
  },
  'pretorio': {
    fact: 'The Praetorian Guard, created by Augustus to protect the emperor, grew powerful enough to auction the throne itself in AD 193 — selling it to the highest bidder, Didius Julianus.',
    example: 'La guardia pretoria proteggeva l\'imperatore.',
    exampleTranslation: 'The Praetorian Guard protected the emperor.',
  },
  'barbaro': {
    fact: 'Rome borrowed "barbarus" from the Greek barbaros, an onomatopoeic jab at foreign speech sounding like meaningless "bar-bar" babble — the word was always about language, not violence, first.',
    example: 'I barbari attaccarono i confini dell\'impero.',
    exampleTranslation: 'The barbarians attacked the empire\'s borders.',
  },
  'gloria': {
    fact: 'Public gloria — recognition through visible achievement — was one of the most powerful motivators in Roman politics; triumphal parades through the city existed specifically to put it on display.',
    example: 'Il generale tornò a Roma per la gloria della vittoria.',
    exampleTranslation: 'The general returned to Rome for the glory of victory.',
  },
  'virtù': {
    fact: 'Latin virtus (from vir, "man") originally meant something closer to "manly courage in battle" before broadening toward the general sense of moral excellence the modern word carries.',
    example: 'La virtù era considerata la qualità più importante di un cittadino.',
    exampleTranslation: 'Virtue was considered a citizen\'s most important quality.',
    philosophy: 'Machiavelli\'s virtù in The Prince deliberately revives this older, harder Roman sense — decisive strength and mastery of fortune — against the softer Christian meaning "virtue" had acquired by his own time.',
  },
  'patria': {
    fact: '"Patria" derives from pater ("father") — the fatherland was conceived as an extended family the citizen owed the same loyalty to as his own household.',
    example: 'Molti soldati morirono per la patria.',
    exampleTranslation: 'Many soldiers died for their homeland.',
  },
  'legge': {
    fact: 'The Twelve Tables (451–450 BC), Rome\'s first written law code, were reportedly posted in the Forum specifically so plebeians could see the law was no longer whatever patrician judges said it was.',
    example: 'La legge era uguale per tutti i cittadini.',
    exampleTranslation: 'The law was the same for all citizens.',
  },
  'oracolo': {
    fact: 'Romans consulted the Sibylline Books — a collection of oracular verses — only in moments of state emergency, kept locked away and guarded by a dedicated college of priests.',
    example: 'L\'oracolo predisse eventi importanti.',
    exampleTranslation: 'The oracle foretold important events.',
  },
  'tempio': {
    fact: 'A Roman temple\'s consecrated ground (templum) was defined by a priest\'s ritual observation of the sky — the same augural practice used to read omens from bird flight before any major state decision.',
    example: 'Il tempio era dedicato agli dei.',
    exampleTranslation: 'The temple was dedicated to the gods.',
  },
  'senatore': {
    fact: 'A senator needed property worth at least one million sesterces under Augustus\'s reforms — the Senate was a wealth-gated body from the very start of the Empire, not just the Republic.',
    example: 'Il senatore parlò davanti all\'assemblea.',
    exampleTranslation: 'The senator spoke before the assembly.',
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
