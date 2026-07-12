/**
 * Curated, pre-authored content for the Spanish/Civil War theme, keyed by
 * the lowercased term. Each entry pairs a modern Spanish word with (a) a
 * checked historical note, (b) an example sentence + English translation,
 * and (c) for the most conceptually loaded words, a one-line philosophical
 * cross-reference. Deliberately not API-generated; extend this pool over
 * time. Unmatched terms simply get nothing, which is preferable to a
 * misleading generic blurb.
 * @typedef {Object} SpanishEntry
 * @property {string} fact
 * @property {string} example
 * @property {string} exampleTranslation
 * @property {string} [philosophy]
 * @type {Record<string, SpanishEntry>}
 */
export const SPANISH_ENTRIES = {
  'milicia': {
    fact: 'In the war\'s first months, volunteer militias — often organized by union or party rather than a central command — held the front before the Republican Army was formally reorganized in 1937.',
    example: 'La milicia defendió la ciudad durante meses.',
    exampleTranslation: 'The militia defended the city for months.',
  },
  'frente': {
    fact: 'The war split Spain into a patchwork of shifting fronts — Madrid, Aragón, the Ebro — rather than one continuous line, making the front a place you tracked on the radio as much as a place you stood.',
    example: 'Los periodistas informaban desde el frente.',
    exampleTranslation: 'Journalists reported from the front.',
  },
  'censura': {
    fact: 'Both sides ran press censorship offices; foreign correspondents in Madrid had their dispatches read and cut before they could be telegraphed out.',
    example: 'El artículo pasó por la censura antes de publicarse.',
    exampleTranslation: 'The article went through censorship before being published.',
    philosophy: 'George Orwell, who fought with the POUM militia, later wrote in "Homage to Catalonia" that watching wartime censorship shape the news taught him more about how propaganda works than anything he\'d read.',
  },
  'republicano': {
    fact: 'The Second Spanish Republic (1931–39) was the elected government the war was fought over — its supporters spanned socialists, communists, anarchists, and republicans who otherwise agreed on little else.',
    example: 'El gobierno republicano resistió el avance enemigo.',
    exampleTranslation: 'The Republican government resisted the enemy advance.',
  },
  'sublevación': {
    fact: 'The war began as a military uprising in July 1936 against the elected government — it succeeded in some garrison towns and failed in others, which is why the country split into two zones instead of one side simply winning.',
    example: 'La sublevación militar comenzó en julio de mil novecientos treinta y seis.',
    exampleTranslation: 'The military uprising began in July 1936.',
  },
  'trinchera': {
    fact: 'Long stretches of the war, especially around Madrid and the Ebro, bogged down into trench warfare reminiscent of the First World War rather than the mobile campaigns later fought in the same country.',
    example: 'Los soldados pasaron el invierno en la trinchera.',
    exampleTranslation: 'The soldiers spent the winter in the trench.',
  },
  'exilio': {
    fact: 'Roughly half a million people crossed into France after the Republic\'s defeat in 1939 — La Retirada — many held in improvised beach camps before scattering across Europe and Latin America.',
    example: 'Muchos artistas vivieron en el exilio después de la guerra.',
    exampleTranslation: 'Many artists lived in exile after the war.',
    philosophy: 'Hannah Arendt, writing on statelessness after her own exile, argued that losing a state strips a person of the "right to have rights" — the exact bureaucratic limbo many Spanish refugees faced in French camps.',
  },
  'brigada': {
    fact: 'The International Brigades brought roughly 35,000 volunteers from over 50 countries to fight for the Republic — writers, students, and workers who paid their own way to a war that wasn\'t theirs.',
    example: 'Voluntarios de muchos países se unieron a la brigada.',
    exampleTranslation: 'Volunteers from many countries joined the brigade.',
  },
  'bombardeo': {
    fact: 'The bombing of Guernica in April 1937 by German and Italian aircraft — a civilian town with no real military target — became the war\'s most infamous act and the subject of Picasso\'s mural of the same name.',
    example: 'El bombardeo destruyó gran parte del pueblo.',
    exampleTranslation: 'The bombing destroyed much of the town.',
  },
  'no pasarán': {
    fact: 'Coined (or popularized) by Dolores Ibárruri — "La Pasionaria" — in a 1936 radio speech defending Madrid, the phrase became the Republic\'s defining slogan and later a rallying cry far beyond Spain.',
    example: '"¡No pasarán!" se convirtió en el grito de la defensa de Madrid.',
    exampleTranslation: '"They shall not pass!" became the cry of Madrid\'s defense.',
    philosophy: 'The line echoes Pétain\'s WWI "Ils ne passeront pas" at Verdun — a case of the same defiant sentence being claimed by opposite ends of the political spectrum a generation apart.',
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getSpanishFact(term) {
  return SPANISH_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getSpanishExample(term) {
  const entry = SPANISH_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getSpanishPhilosophy(term) {
  return SPANISH_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
