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

// Deliberately keyed to words *outside* the default seed set (see
// db/seedWords.js) — a secret tied to a seed word would be discovered by
// every user the moment they click "add sample words" during onboarding,
// which defeats the "rare, hand-found easter egg" premise entirely. Every
// term below only becomes reachable by capturing a genuinely new word from
// the web.
/** @type {SecretDef[]} */
export const SECRETS = [
  {
    themeId: 'russian',
    term: 'ракета',
    title: 'Same Rocket, Two Jobs',
    icon: '🚀',
    anecdote:
      "The R-7 Semyorka was designed first as an intercontinental ballistic missile — launching Sputnik was a secondary use of the same hardware. The \"peaceful\" space race and the nuclear arms race ran on literally the same rocket.",
  },
  {
    themeId: 'russian',
    term: 'гулаг',
    title: 'A Manuscript Worth Dying For',
    icon: '📖',
    anecdote:
      "Solzhenitsyn wrote \"The Gulag Archipelago\" largely from memory after the KGB seized an early draft in 1965, an event that drove the woman who had hidden it to suicide. The finished manuscript was typed on onionskin paper thin enough to conceal inside a book's binding.",
  },
  {
    themeId: 'russian',
    term: 'самиздат',
    title: 'Six Copies, One Typewriter',
    icon: '📝',
    anecdote:
      'A single typewriter and carbon paper could produce about six legible copies of a banned text at once — the sixth was often barely readable. People passed it along anyway, since refusing to forward a samizdat text was itself seen as a quiet form of complicity.',
  },
  {
    themeId: 'russian',
    term: 'номенклатура',
    title: 'The Invisible Shop',
    icon: '🛍',
    anecdote:
      'While ordinary Soviet citizens queued for hours for basic goods, the nomenklatura shopped at unmarked "Beryozka" stores stocked with Western imports — paid for in a special internal currency ordinary rubles couldn\'t buy.',
  },
  {
    themeId: 'russian',
    term: 'застой',
    title: 'Three Funerals in Three Years',
    icon: '⚰',
    anecdote:
      'Between 1982 and 1985 the USSR buried three General Secretaries in a row — Brezhnev, Andropov, Chernenko. Soviet state television reportedly kept a standard funeral broadcast format on file, since another one always seemed imminent.',
  },
  {
    themeId: 'russian',
    term: 'коммунизм',
    title: 'Homo Sovieticus',
    icon: '🧬',
    anecdote:
      'Soviet ideology functioned as a substitute religion: Marxism-Leninism replaced faith with dogma, and the state pursued a doctrine of dissolving every ethnic and national identity into a single "Homo Sovieticus" — a citizen defined by class consciousness and loyalty to the "Socialist Motherland" rather than by nationality.',
  },
  {
    themeId: 'italian',
    term: 'pretorio',
    title: 'An Empire Sold at Auction',
    icon: '🔨',
    anecdote:
      'In AD 193, after murdering Emperor Pertinax, the Praetorian Guard literally auctioned the imperial throne to the highest bidder. The winner, Didius Julianus, ruled just 66 days before being deposed and executed.',
  },
  {
    themeId: 'italian',
    term: 'tribuno',
    title: 'The Untouchable Office',
    icon: '🛡',
    anecdote:
      "A tribune's person was sacrosanct — harming one, even accidentally in a crowd, was technically a capital offense. The office gave ordinary plebeians a legal shield that not even a consul could override.",
  },
  {
    themeId: 'italian',
    term: 'toga',
    title: 'Heavy as a Blanket',
    icon: '🧵',
    anecdote:
      'A full formal toga could use up to 20 feet of wool and weighed several kilograms. Draping one correctly required a servant\'s help — part of why most Romans avoided wearing one except on state occasions.',
  },
  {
    themeId: 'italian',
    term: 'oracolo',
    title: 'Burned Twice, Bought Once',
    icon: '🔥',
    anecdote:
      'Legend holds that the Sibyl offered King Tarquin nine prophetic books at a steep price. He refused twice, watching her burn three books after each refusal — and ultimately paid the original full price for the three that remained.',
  },
  {
    themeId: 'italian',
    term: 'virtù',
    title: 'A Word Machiavelli Weaponized',
    icon: '⚔',
    anecdote:
      'When Machiavelli revived "virtù" in The Prince, readers were scandalized: he stripped the word of its Christian sense of moral goodness and redefined it as raw political skill — cunning, boldness, and the willingness to break a promise when it served the state.',
  },
  {
    themeId: 'portuguese',
    term: 'mapa',
    title: 'A Map Worth Dying For',
    icon: '🗺',
    anecdote:
      'Portuguese law made leaking a nautical chart to a foreign power punishable by death. Historians still debate whether this secrecy — not a lack of surviving copies — is why so few original 15th-century Portuguese charts exist today; most were likely destroyed rather than risk capture.',
  },
  {
    themeId: 'portuguese',
    term: 'naufrágio',
    title: 'Bestseller by Disaster',
    icon: '📖',
    anecdote:
      'Shipwreck survivor accounts (Histórias Trágico-Marítimas) became one of the best-selling literary genres in 16th-century Portugal — readers devoured tales of scurvy, mutiny, and castaway survival the way modern audiences consume disaster documentaries.',
  },
  {
    themeId: 'portuguese',
    term: 'tesouro',
    title: "One Building, an Empire's Cargo",
    icon: '🏛',
    anecdote:
      "The Casa da Índia in Lisbon processed the entire kingdom's Asian and African trade through a single building — spices, gold, and enslaved people were all logged, taxed, and warehoused under one roof, steps from the royal palace.",
  },
  {
    themeId: 'portuguese',
    term: 'rei',
    title: 'The King Who Said No to Columbus',
    icon: '👑',
    anecdote:
      "João II's own navigational experts rejected Columbus's proposed westward route to Asia as under-budgeted for the true distance involved — a judgment later vindicated in an unexpected way, since Columbus's ships met land roughly where he'd estimated, only it wasn't Asia.",
  },
  {
    themeId: 'portuguese',
    term: 'feitoria',
    title: 'A Chain, Not a Country',
    icon: '⛓',
    anecdote:
      'Rather than large territorial colonies, early Portugal built its empire as a scattered chain of fortified feitorias from West Africa to Nagasaki — some held by as few as a dozen men guarding a warehouse and a cannon.',
  },
  {
    themeId: 'french',
    term: 'bastille',
    title: 'Seven Prisoners, One Symbol',
    icon: '🗝',
    anecdote:
      'The Bastille held only seven prisoners the day it fell — four forgers, two men held for insanity, and one nobleman jailed at his own family\'s request. Its capture became the Revolution\'s founding myth regardless of how empty it actually was.',
  },
  {
    themeId: 'french',
    term: 'comité',
    title: 'Twelve Men, No Single Leader',
    icon: '👥',
    anecdote:
      'The Committee of Public Safety governed as a rotating twelve-member body, re-elected by the Convention every month. Robespierre, often remembered as the Terror\'s dictator, never held a formal title higher than "member".',
  },
  {
    themeId: 'french',
    term: 'sans-culotte',
    title: 'A Fashion Choice Becomes an Identity',
    icon: '👖',
    anecdote:
      'Long trousers were originally just practical working-class clothing. Revolutionaries embraced the "sans-culotte" label so completely that by 1793, wearing aristocratic knee-breeches in public could get you suspected of being a royalist.',
  },
  {
    themeId: 'french',
    term: 'reine',
    title: 'A Quote She Never Said',
    icon: '💬',
    anecdote:
      '"Let them eat cake" first appears in Rousseau\'s Confessions, written when Marie-Antoinette was still a child in Austria — the line was already old gossip about an unnamed princess, decades before it was ever pinned on her.',
  },
  {
    themeId: 'french',
    term: 'décret',
    title: 'Same-Day Law',
    icon: '📜',
    anecdote:
      'The revolutionary Convention could debate, vote, and enact a decree within a single sitting. Some of France\'s most consequential 1790s reforms — including the metric system — went from proposal to binding law in a matter of hours.',
  },
  {
    themeId: 'spanish',
    term: 'golpe',
    title: 'A Coup That Failed Upward',
    icon: '⚡',
    anecdote:
      'The July 1936 coup was designed to seize power within days. Its failure to take Madrid and Barcelona outright is the specific reason a fast coup turned into a three-year war instead.',
  },
  {
    themeId: 'spanish',
    term: 'fusilamiento',
    title: 'A Body Never Found',
    icon: '🖋',
    anecdote:
      'Poet Federico García Lorca was executed near Granada in August 1936. Despite decades of searching and multiple exhumation attempts, his remains have never been conclusively identified.',
  },
  {
    themeId: 'spanish',
    term: 'propaganda',
    title: 'Posters as Weapons',
    icon: '🖼',
    anecdote:
      'Republican propaganda posters, many designed by volunteer avant-garde artists, were mass-produced by the thousands and pasted across cities — some of the era\'s most influential graphic design was made anonymously, for a cause rather than a byline.',
  },
  {
    themeId: 'spanish',
    term: 'memoria',
    title: 'Digging Started Decades Later',
    icon: '⛏',
    anecdote:
      "Spain's first systematic exhumations of Civil War mass graves, under the 2007 Law of Historical Memory, began nearly seventy years after the war ended — some families only located a relative's remains in the 2010s.",
  },
  {
    themeId: 'spanish',
    term: 'posguerra',
    title: 'Rationing Outlasted the War',
    icon: '🍞',
    anecdote:
      'Food rationing under Franco\'s postwar government lasted into the 1950s. For many Spaniards, "Los Años del Hambre" (the Hunger Years) after the fighting stopped were harder to survive than the war itself.',
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
