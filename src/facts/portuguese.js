/**
 * Curated, pre-authored content for the Portuguese/Age of Discovery theme,
 * keyed by the lowercased term. Mirrors russian.js's shape: fact + example
 * sentence + optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const PORTUGUESE_ENTRIES = {
  'caravela': {
    fact: 'The caravel, able to sail against the wind thanks to its lateen sails, was the Portuguese invention that technically made the Atlantic voyages of discovery possible.',
    example: 'A caravela navegava contra o vento.',
    exampleTranslation: 'The caravel sailed against the wind.',
  },
  'descobrimento': {
    fact: 'The entire era is still known in Portuguese by the proper name "Os Descobrimentos" (The Discoveries).',
    example: 'O descobrimento do Brasil ocorreu em mil e quinhentos.',
    exampleTranslation: 'The discovery of Brazil took place in 1500.',
    philosophy: "Francis Bacon's empirical conception of knowledge in the Novum Organum — learning by observing and testing nature — shares its roots with the Age of Discovery's practical navigational knowledge: both reject the medieval reliance on textual authority.",
  },
  'saudade': {
    fact: 'An untranslatable word capturing the feeling shared by sailors gone for months at sea and those waiting on the Lisbon docks; it became a cultural identity in this era.',
    example: 'Sinto muita saudade da minha terra.',
    exampleTranslation: 'I long deeply for my homeland.',
    philosophy: "Fernando Pessoa's \"saudosismo\" defines saudade not merely as longing but as the felt presence of something never lived or never to return — a phenomenological experience of time.",
  },
  'especiarias': {
    fact: "The one true motive behind the route to India; a single ship's hold of pepper could pay back a voyage's entire cost many times over.",
    example: 'As especiarias valiam mais do que ouro.',
    exampleTranslation: 'Spices were worth more than gold.',
  },
  'astrolábio': {
    fact: "Portuguese pilots adapted this instrument for use at sea, calculating latitude from the sun's height above the horizon.",
    example: 'O piloto usava o astrolábio para calcular a latitude.',
    exampleTranslation: 'The pilot used the astrolabe to calculate latitude.',
    philosophy: "The astrolabe is a concrete tool of the rationalist worldview that reduces nature to numbers — making the sky measurable was an early application of the pre-Galilean intuition that \"the universe is written in the language of mathematics\".",
  },
  'roteiro': {
    fact: 'Originally secret pilot logs recording coastlines and routes, treated as state secrets.',
    example: 'O roteiro da viagem era um segredo de estado.',
    exampleTranslation: "The voyage's route log was a state secret.",
  },
  'padrão': {
    fact: "The name of the stone pillar bearing the Portuguese coat of arms, planted on every newly discovered coastline; several of Diogo Cão's still stand on the African coast.",
    example: 'O padrão marcava a nova terra descoberta.',
    exampleTranslation: 'The marker pillar marked the newly discovered land.',
  },
  'monção': {
    fact: "Entered Portuguese from Arabic in this era; crossing the Indian Ocean depended entirely on knowing the monsoon winds' calendar.",
    example: 'Os navios esperavam a monção para partir.',
    exampleTranslation: 'The ships waited for the monsoon to set sail.',
  },
  'leme': {
    fact: 'The sternpost rudder was the key to keeping a caravel steerable in ocean swells.',
    example: 'O leme quebrou durante a tempestade.',
    exampleTranslation: 'The rudder broke during the storm.',
  },
  'marinheiro': {
    fact: "The sailors trained around Sagres under Prince Henry are considered Europe's first systematically-trained ocean navigators.",
    example: 'O marinheiro passou anos no mar.',
    exampleTranslation: 'The sailor spent years at sea.',
    philosophy: "Camões's epic Os Lusíadas portrays the sailor as a new kind of figure, fusing the classical heroic ideal (Homer's Odysseus) with Christian Renaissance humanism.",
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getPortugueseFact(term) {
  return PORTUGUESE_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getPortugueseExample(term) {
  const entry = PORTUGUESE_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getPortuguesePhilosophy(term) {
  return PORTUGUESE_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
