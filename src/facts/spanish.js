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
  'guerra': {
    fact: 'Historians still debate whether to call it a civil war or a dress rehearsal for World War II — Germany and Italy openly tested tactics and aircraft here three years before invading Poland.',
    example: 'La guerra civil duró casi tres años.',
    exampleTranslation: 'The civil war lasted almost three years.',
  },
  'nacionalista': {
    fact: 'The Nationalist faction was itself a coalition of monarchists, Falangist fascists, and Catholic conservatives united mainly by opposition to the Republic — Franco only consolidated full command over them in 1937.',
    example: 'Las fuerzas nacionalistas avanzaron hacia el norte.',
    exampleTranslation: 'The Nationalist forces advanced northward.',
  },
  'golpe': {
    fact: 'The July 1936 coup (golpe de estado) was meant to seize power in days — its failure in major cities like Madrid and Barcelona is exactly what turned a quick coup into a three-year war.',
    example: 'El golpe de estado fracasó en varias ciudades.',
    exampleTranslation: 'The coup failed in several cities.',
  },
  'refugiado': {
    fact: 'Nearly half a million refugees crossed the Pyrenees into France in early 1939 in what became known as La Retirada — many were held in hastily built beach internment camps.',
    example: 'Miles de refugiados cruzaron la frontera francesa.',
    exampleTranslation: 'Thousands of refugees crossed the French border.',
  },
  'resistencia': {
    fact: 'Armed resistance to Franco\'s regime, the maquis, continued in the mountains for years after the war officially ended in 1939 — some guerrilla cells held out into the early 1950s.',
    example: 'La resistencia continuó después del fin de la guerra.',
    exampleTranslation: 'The resistance continued after the war ended.',
  },
  'propaganda': {
    fact: 'Both sides produced striking poster art — Republican posters leaned on bold Constructivist-influenced graphic design, some of it created by volunteer artists who\'d later become internationally known.',
    example: 'Los carteles de propaganda cubrían las paredes de la ciudad.',
    exampleTranslation: "Propaganda posters covered the city's walls.",
  },
  'dictadura': {
    fact: "Franco's dictatorship, which followed the war, lasted until his death in 1975 — 36 years, making it one of 20th-century Europe's longest-running authoritarian regimes.",
    example: 'La dictadura duró casi cuatro décadas.',
    exampleTranslation: 'The dictatorship lasted almost four decades.',
  },
  'democracia': {
    fact: "Spain's fragile Second Republic (1931–39) was itself an experiment in mass democracy barely a decade old — including one of Europe's earliest grants of women's suffrage, in 1931 — when the war cut it short.",
    example: 'La democracia fue interrumpida por el conflicto.',
    exampleTranslation: 'Democracy was interrupted by the conflict.',
  },
  'huelga': {
    fact: 'General strikes were a recurring weapon of the Spanish labor movement well before 1936 — the anarchist union CNT had already organized nationwide strikes in the years leading up to the war.',
    example: 'Los trabajadores organizaron una huelga general.',
    exampleTranslation: 'The workers organized a general strike.',
  },
  'sindicato': {
    fact: 'Spain\'s two rival labor federations — the anarchist CNT and the socialist UGT — sometimes cooperated and sometimes fought each other, a split that weakened the Republican side from within during the war.',
    example: 'El sindicato representaba a miles de obreros.',
    exampleTranslation: 'The union represented thousands of workers.',
  },
  'fusilamiento': {
    fact: 'Poet Federico García Lorca was executed by firing squad near Granada in August 1936; his body was never found, and the killing became one of the war\'s most mourned symbols of its cultural cost.',
    example: 'El fusilamiento del poeta conmocionó al país.',
    exampleTranslation: "The poet's execution shocked the country.",
  },
  'posguerra': {
    fact: 'The postwar decade brought Los Años del Hambre ("the Hunger Years") — food rationing under Franco lasted into the 1950s, worse for many Spaniards than wartime shortages had been.',
    example: 'La posguerra trajo hambre y escasez.',
    exampleTranslation: 'The postwar period brought hunger and scarcity.',
  },
  'memoria': {
    fact: 'Spain\'s 2007 "Law of Historical Memory" was the first major state effort to formally recognize victims on both sides — decades after the war, exhumations of mass graves are still ongoing today.',
    example: 'La memoria histórica sigue siendo un tema debatido.',
    exampleTranslation: 'Historical memory remains a debated topic.',
  },
  'paz': {
    fact: 'Franco\'s regime marked April 1 — the day of Republican surrender in 1939 — as the "Día de la Victoria", officially framed as a day of peace rather than defeat for the losing side.',
    example: 'La paz llegó después de mucho sufrimiento.',
    exampleTranslation: 'Peace came after much suffering.',
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
