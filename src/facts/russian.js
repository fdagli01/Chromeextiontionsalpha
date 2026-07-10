/**
 * Curated, pre-authored content for the Russian/Cold War theme, keyed by
 * the lowercased term. Each entry pairs a modern Russian word with (a) a
 * checked historical note, (b) an example sentence + English translation,
 * and (c) for the most conceptually loaded words, a one-line philosophical
 * cross-reference. Deliberately not API-generated; extend this pool over
 * time. Unmatched terms simply get nothing, which is preferable to a
 * misleading generic blurb.
 * @typedef {Object} RussianEntry
 * @property {string} fact
 * @property {string} example
 * @property {string} exampleTranslation
 * @property {string} [philosophy]
 * @type {Record<string, RussianEntry>}
 */
export const RUSSIAN_ENTRIES = {
  'товарищ': {
    fact: 'The official form of address in the Soviet era — a deliberate expression of equality that rejected class distinctions.',
    example: 'Товарищ, помогите мне, пожалуйста.',
    exampleTranslation: 'Comrade, please help me.',
    philosophy: "In Marx's vision of a classless society, the address \"comrade\" emphasizes shared labor and equality rather than hierarchy — a deliberate rejection of bourgeois \"master/servant\" language.",
  },
  'спутник': {
    fact: 'Sputnik 1, launched in 1957, was the first artificial Earth satellite and the opening shot of the Space Race.',
    example: 'Первый спутник запустили в тысяча девятьсот пятьдесят седьмом году.',
    exampleTranslation: 'The first satellite was launched in 1957.',
  },
  'гласность': {
    fact: "The name of Gorbachev's transparency policy in the 1980s, which loosened Soviet press censorship.",
    example: 'Политика гласности изменила советское общество.',
    exampleTranslation: 'The policy of openness changed Soviet society.',
    philosophy: "Gorbachev's principle of glasnost echoes J.S. Mill's thesis in On Liberty that \"the free collision of ideas reveals the truth\" — the idea that censorship protects only power, not truth.",
  },
  'перестройка': {
    fact: "The name of Gorbachev's economic and political reform program, which paved the way for the USSR's collapse.",
    example: 'Перестройка началась в тысяча девятьсот восемьдесят пятом году.',
    exampleTranslation: 'Restructuring began in 1985.',
  },
  'кремль': {
    fact: 'Literally "fortress/citadel". The Moscow Kremlin became the symbol of Russian government; the word itself simply means an inner citadel.',
    example: 'Кремль находится в центре Москвы.',
    exampleTranslation: 'The Kremlin stands in the center of Moscow.',
  },
  'шпион': {
    fact: 'Cold War spy-swap operations between the K.G.B. and the C.I.A. (like the Glienicke Bridge exchanges) became legendary.',
    example: 'Этот человек оказался иностранным шпионом.',
    exampleTranslation: 'This man turned out to be a foreign spy.',
  },
  'агент': {
    fact: "K.G.B. code-named agents lived under deep-cover identities for decades to infiltrate Western intelligence services.",
    example: 'Агент передал секретное сообщение.',
    exampleTranslation: 'The agent delivered the secret message.',
  },
  'секрет': {
    fact: '"Совершенно секретно" ("Top secret") was the highest classification level on Soviet documents.',
    example: 'Это совершенно секретная информация.',
    exampleTranslation: 'This is completely secret information.',
  },
  'свобода': {
    fact: '"Radio Svoboda" (Radio Liberty) was a U.S.-backed station broadcasting uncensored news behind the Iron Curtain throughout the Cold War.',
    example: 'Свобода слова — важное право человека.',
    exampleTranslation: 'Freedom of speech is an important human right.',
    philosophy: "Isaiah Berlin's distinction between \"negative liberty\" (freedom from interference) and \"positive liberty\" (self-determination) explains why Soviet \"freedom\" rhetoric functioned differently from its Western sense.",
  },
  'граница': {
    fact: 'The borders running along the Iron Curtain were among the most heavily guarded and mined stretches on Earth.',
    example: 'Граница между странами была закрыта.',
    exampleTranslation: 'The border between the two countries was closed.',
  },
  'ракета': {
    fact: "The Soviet rocket program developed the world's first intercontinental ballistic missile (the R-7) in 1957.",
    example: 'Ракета взлетела с космодрома.',
    exampleTranslation: 'The rocket launched from the spaceport.',
  },
  'революция': {
    fact: 'The October Revolution of 1917 brought the Bolsheviks to power and laid the groundwork for the founding of the USSR.',
    example: 'Революция изменила ход истории.',
    exampleTranslation: 'The revolution changed the course of history.',
    philosophy: "Marx's historical materialism treats revolution not as the product of individual will but as the inevitable result of contradictions in the relations of production — Hegel's dialectic applied to history.",
  },
  'партия': {
    fact: "The Communist Party of the Soviet Union (CPSU) was the country's sole legal political party, controlling every level of the state.",
    example: 'Он вступил в коммунистическую партию.',
    exampleTranslation: 'He joined the Communist Party.',
    philosophy: "Lenin's \"vanguard party\" theory transforms Rousseau's concept of the \"general will\", arguing that a disciplined cadre — not the masses themselves — can represent it.",
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianFact(term) {
  return RUSSIAN_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getRussianExample(term) {
  const entry = RUSSIAN_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianPhilosophy(term) {
  return RUSSIAN_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
