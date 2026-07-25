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
  'révolution': {
    fact: 'Before 1789, "révolution" mostly described the cyclical turning of celestial bodies — the Revolution is largely why the word came to mean an irreversible political break instead.',
    example: 'La Révolution française commença en mille sept cent quatre-vingt-neuf.',
    exampleTranslation: 'The French Revolution began in 1789.',
  },
  'république': {
    fact: 'France has had five republics since 1792, each launched by a constitutional break — the current Fifth Republic dates only to 1958, under de Gaulle.',
    example: 'La République fut proclamée en mille sept cent quatre-vingt-douze.',
    exampleTranslation: 'The Republic was proclaimed in 1792.',
  },
  'monarchie': {
    fact: "The National Assembly initially tried to preserve a constitutional monarchy in 1791 — abolishing it outright only followed Louis XVI's failed flight to Varennes, which destroyed public trust in his loyalty to the new order.",
    example: 'La monarchie fut abolie en septembre mille sept cent quatre-vingt-douze.',
    exampleTranslation: 'The monarchy was abolished in September 1792.',
  },
  'roi': {
    fact: 'Louis XVI was tried not as a king but as "Citizen Louis Capet" — the Convention stripped his title before trial specifically to try him as an ordinary man under the law he\'d once stood above.',
    example: 'Le roi fut jugé par la Convention nationale.',
    exampleTranslation: 'The king was tried by the National Convention.',
  },
  'reine': {
    fact: 'Marie-Antoinette never actually said "let them eat cake" — the line predates her by decades in Rousseau\'s Confessions, attributed there to an unnamed "great princess".',
    example: 'La reine fut exécutée en octobre mille sept cent quatre-vingt-treize.',
    exampleTranslation: 'The queen was executed in October 1793.',
  },
  'noblesse': {
    fact: 'The Night of August 4, 1789 saw the nobility voluntarily renounce its feudal privileges in a single overnight Assembly session — driven partly by genuine idealism, partly by panic over peasant uprisings already underway.',
    example: 'La noblesse perdit ses privilèges en mille sept cent quatre-vingt-neuf.',
    exampleTranslation: 'The nobility lost its privileges in 1789.',
  },
  'clergé': {
    fact: 'The Civil Constitution of the Clergy (1790) required priests to swear loyalty to the state over Rome — roughly half refused, splitting French Catholicism into "juring" and "non-juring" clergy for years.',
    example: 'Le clergé se divisa sur la question du serment.',
    exampleTranslation: 'The clergy split over the question of the oath.',
  },
  'bastille': {
    fact: 'The Bastille held only seven prisoners on July 14, 1789 — its fall mattered as a symbol of royal arbitrary power and as a source of gunpowder, not because it emptied a crowded dungeon.',
    example: 'La prise de la Bastille marqua le début de la Révolution.',
    exampleTranslation: "The storming of the Bastille marked the Revolution's beginning.",
  },
  'tribunal': {
    fact: 'The Revolutionary Tribunal, created in 1793, tried over 2,700 people in Paris alone during the Terror — most trials lasted under a day, and after the Law of 22 Prairial, defendants lost the right to counsel entirely.',
    example: 'Le tribunal révolutionnaire jugeait rapidement les accusés.',
    exampleTranslation: 'The Revolutionary Tribunal judged the accused quickly.',
  },
  'comité': {
    fact: "The Committee of Public Safety (Comité de salut public), meant as an emergency wartime executive, became the Terror's twelve-man governing core — Robespierre was only one voice among them, not a sole dictator.",
    example: 'Le Comité de salut public dirigeait le pays en temps de crise.',
    exampleTranslation: 'The Committee of Public Safety ran the country in the crisis.',
  },
  'décret': {
    fact: 'The Convention could pass a decree and put it into force the same day — the sheer speed of revolutionary lawmaking was itself part of what made the era feel irreversible to people living through it.',
    example: 'Le décret fut voté à l\'unanimité.',
    exampleTranslation: 'The decree was passed unanimously.',
  },
  'patriote': {
    fact: '"Patriote" in 1789 specifically meant a supporter of the Revolution against the old order — a political label, not simply "someone who loves their country" as in modern usage.',
    example: 'Les patriotes défendaient les idéaux révolutionnaires.',
    exampleTranslation: 'The patriots defended the revolutionary ideals.',
  },
  'aristocrate': {
    fact: 'By 1793, "aristocrate" had become a dangerously loose accusation — it could be leveled at anyone from an actual noble to a merchant merely suspected of insufficient revolutionary zeal.',
    example: "On accusait facilement quelqu'un d'être aristocrate.",
    exampleTranslation: 'People were easily accused of being an aristocrat.',
  },
  'sans-culotte': {
    fact: 'Literally "without knee-breeches" — the working-class radicals who wore long trousers instead of the aristocratic culotte, turning a garment difference into their own political identity.',
    example: 'Les sans-culottes manifestaient dans les rues de Paris.',
    exampleTranslation: 'The sans-culottes marched in the streets of Paris.',
  },
  'girondin': {
    fact: 'The Girondins, named for many members hailing from the Gironde region, favored a federal, moderate republic — their defeat by the more centralist Jacobins in 1793 sent most of their leaders to the guillotine.',
    example: 'Les girondins furent éliminés par les jacobins en mille sept cent quatre-vingt-treize.',
    exampleTranslation: 'The Girondins were eliminated by the Jacobins in 1793.',
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
