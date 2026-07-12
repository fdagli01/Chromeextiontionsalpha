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
  'navegador': {
    fact: 'Prince Henry "the Navigator" (Henrique o Navegador) himself rarely sailed — the epithet, coined by later English historians, honors the school of navigation and cartography he sponsored at Sagres.',
    example: 'O navegador estudava as estrelas para se orientar.',
    exampleTranslation: 'The navigator studied the stars to find his bearings.',
  },
  'feitoria': {
    fact: 'A feitoria was a fortified trading post, not a colony to settle — Portugal\'s early empire was built as a chain of these coastal outposts along Africa and Asia rather than large inland territories.',
    example: 'A feitoria controlava o comércio de especiarias na região.',
    exampleTranslation: 'The trading post controlled the region\'s spice trade.',
  },
  'colônia': {
    fact: 'Brazil, claimed in 1500, only became Portugal\'s dominant colony from the 1690s onward, once gold was discovered inland in Minas Gerais — before that, Asian trade mattered more to the crown.',
    example: 'A colônia enviava ouro para Portugal.',
    exampleTranslation: 'The colony sent gold to Portugal.',
  },
  'ouro': {
    fact: 'The Brazilian gold rush of the 18th century made Portugal, briefly, one of the wealthiest states in Europe — much of that gold flowed straight through to England to pay for manufactured goods.',
    example: 'Encontraram ouro nas montanhas do Brasil.',
    exampleTranslation: 'They found gold in the mountains of Brazil.',
  },
  'mapa': {
    fact: 'Portuguese crown policy classified accurate nautical charts as state secrets (segredo de estado) — sharing one with a foreign power could carry the death penalty.',
    example: 'O mapa mostrava rotas desconhecidas.',
    exampleTranslation: 'The map showed unknown routes.',
  },
  'bússola': {
    fact: 'The magnetic compass reached Europe via Arab and Chinese intermediaries centuries before the Age of Discovery, but Portuguese pilots were among the first to combine it systematically with celestial navigation.',
    example: 'A bússola indicava sempre o norte.',
    exampleTranslation: 'The compass always pointed north.',
  },
  'vento': {
    fact: 'Portuguese pilots discovered the volta do mar ("turn of the sea") — sailing far out into the Atlantic to catch favorable winds home — a technique that made round-trip African voyages practical.',
    example: 'O vento soprava forte no oceano.',
    exampleTranslation: 'The wind blew strong over the ocean.',
  },
  'porto': {
    fact: 'Lisbon\'s harbor became the busiest spice-trading port in Europe by the early 1500s, briefly eclipsing Venice, whose overland trade routes the sea passage to India was designed to bypass entirely.',
    example: 'Os navios partiam do porto de Lisboa.',
    exampleTranslation: 'The ships departed from the port of Lisbon.',
  },
  'rei': {
    fact: 'King João II earned the nickname "the Perfect Prince" for personally overseeing the navigation program — and for turning down Columbus\'s proposal before Spain funded it instead.',
    example: 'O rei financiou várias expedições marítimas.',
    exampleTranslation: 'The king financed several maritime expeditions.',
  },
  'coroa': {
    fact: 'The Portuguese crown held a legal monopoly (the "Mina and Guinea trade") over African and Asian commerce — private merchants could sail only with royal license and a cut owed to the treasury.',
    example: 'A coroa controlava todo o comércio ultramarino.',
    exampleTranslation: 'The crown controlled all overseas trade.',
  },
  'tesouro': {
    fact: 'The Casa da Índia in Lisbon functioned as the royal treasury\'s clearinghouse for all goods arriving from Asia and Africa — a customs house, warehouse, and trading company rolled into one institution.',
    example: 'O tesouro real cresceu com o comércio das Índias.',
    exampleTranslation: 'The royal treasury grew with the trade from the Indies.',
  },
  'viagem': {
    fact: "Vasco da Gama's 1497–99 voyage to India took over two years round trip and cost roughly two-thirds of his crew their lives — mostly to scurvy — yet the spices aboard still returned a vast profit.",
    example: 'A viagem para a Índia durou mais de um ano.',
    exampleTranslation: 'The voyage to India lasted more than a year.',
  },
  'naufrágio': {
    fact: 'Shipwreck narratives (Histórias Trágico-Marítimas) became a popular literary genre in 16th-century Portugal — first-person survivor accounts of disaster on the India route, printed and widely read at home.',
    example: 'O naufrágio deixou poucos sobreviventes.',
    exampleTranslation: 'The shipwreck left few survivors.',
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
