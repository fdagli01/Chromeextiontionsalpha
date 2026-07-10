/**
 * Curated, pre-authored content for the French/Revolution theme, keyed by
 * the lowercased term. Mirrors russian.js's shape: fact + example sentence
 * + optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const FRENCH_ENTRIES = {
  'citoyen': {
    fact: 'During the Revolution, "Monsieur/Madame" was banned and "Citoyen/Citoyenne" became the mandatory form of address; it still means "citizen" today.',
    example: 'Chaque citoyen avait le droit de voter.',
    exampleTranslation: 'Every citizen had the right to vote.',
    philosophy: "For Rousseau, citizenship is not merely holding rights but participating in the \"general will\" (volonté générale) — the virtue of subordinating personal interest to the common good.",
  },
  'liberté': {
    fact: "The word of Article 1 of the 1789 Declaration of the Rights of Man and of the Citizen; the first word of the republican motto.",
    example: 'La liberté est un droit fondamental.',
    exampleTranslation: 'Liberty is a fundamental right.',
    philosophy: "Rousseau's famous line in The Social Contract — \"man is born free, and everywhere he is in chains\" — frames liberté not as a natural given, but as something that must be reclaimed through a just social contract.",
  },
  'fraternité': {
    fact: 'The concept added to the motto last (in the 1790s); it is still written into the French constitution today.',
    example: 'La fraternité unit tous les citoyens.',
    exampleTranslation: 'Fraternity unites all citizens.',
    philosophy: "Kant's concept of the \"kingdom of ends\" (Reich der Zwecke) — treating every person as an end, never merely a means — gives fraternité the potential to become a universal moral law.",
  },
  'guillotine': {
    fact: 'Named after Dr. Guillotin, who proposed it as an "egalitarian execution"; in modern French it\'s also used figuratively for "cutting something off ruthlessly".',
    example: 'La guillotine fut utilisée pendant la Révolution.',
    exampleTranslation: 'The guillotine was used during the Revolution.',
  },
  'terreur': {
    fact: 'Gave its name to the Reign of Terror (la Terreur) of 1793-94; today it\'s simply the everyday word for "dread".',
    example: 'La Terreur dura environ un an.',
    exampleTranslation: 'The Reign of Terror lasted about a year.',
    philosophy: "Robespierre's line — \"terror without virtue is powerless, virtue without terror is impotent\" — captures the paradox Hannah Arendt examines in On Revolution: the necessity of suspending freedom in order to protect it.",
  },
  'veto': {
    fact: 'Because of Louis XVI\'s suspensive veto power, the people nicknamed the king and queen "Monsieur/Madame Veto"; the word survives across all of politics today.',
    example: 'Le roi utilisa son droit de veto.',
    exampleTranslation: 'The king exercised his veto right.',
  },
  'assemblée': {
    fact: 'Born from the 1789 Tennis Court Oath, the Assemblée nationale is still the name of the French parliament today.',
    example: "L'Assemblée nationale vota la nouvelle loi.",
    exampleTranslation: 'The National Assembly voted on the new law.',
  },
  'la gauche': {
    fact: 'The political concepts of "left" and "right" were born from where deputies sat relative to the king in the 1789 Assembly.',
    example: 'La gauche siégeait à côté du président.',
    exampleTranslation: 'The left sat beside the president.',
    philosophy: "In Left and Right, Norberto Bobbio argues the divide is essentially an attitude toward equality (left) versus accepting hierarchy as natural (right) — the seating arrangement of the 1789 Assembly was the moment this philosophical axis was born.",
  },
  'mètre': {
    fact: "The metric system was enacted in 1795 as part of the Revolution's project to standardize measurement for everyone; the word spread across the world from there.",
    example: "Le mètre devint l'unité officielle de mesure.",
    exampleTranslation: 'The meter became the official unit of measurement.',
  },
  'vandalisme': {
    fact: "Coined in 1794 by Abbé Grégoire to describe revolutionaries' destruction of monuments; a universal word today.",
    example: 'Le vandalisme des monuments fut condamné.',
    exampleTranslation: 'The vandalism of monuments was condemned.',
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getFrenchFact(term) {
  return FRENCH_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getFrenchExample(term) {
  const entry = FRENCH_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getFrenchPhilosophy(term) {
  return FRENCH_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
