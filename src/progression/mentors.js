import russianHandlerPortrait from '../assets/images/mentors/russian-handler.png'
import russianZealotPortrait from '../assets/images/mentors/russian-zealot.png'
import russianCipherClerkPortrait from '../assets/images/mentors/russian-cipherclerk.png'
import russianDefectorPortrait from '../assets/images/mentors/russian-defector.png'
import italianCenturioPortrait from '../assets/images/mentors/italian-centurio.png'
import italianOraclePortrait from '../assets/images/mentors/italian-oracle.png'
import italianSenatorPortrait from '../assets/images/mentors/italian-senator.png'
import italianGladiatorPortrait from '../assets/images/mentors/italian-gladiator.png'
import portugueseNavigatorPortrait from '../assets/images/mentors/portuguese-navigator.png'
import portugueseCartographerPortrait from '../assets/images/mentors/portuguese-cartographer.png'
import portuguesePriestPortrait from '../assets/images/mentors/portuguese-priest.png'
import portugueseStowawayPortrait from '../assets/images/mentors/portuguese-stowaway.png'
import frenchTribunalPortrait from '../assets/images/mentors/french-tribunal.png'
import frenchSansCulottePortrait from '../assets/images/mentors/french-sansculotte.png'
import frenchAristocratePortrait from '../assets/images/mentors/french-aristocrate.png'
import frenchPamphletairePortrait from '../assets/images/mentors/french-pamphletaire.png'
import spanishCensorPortrait from '../assets/images/mentors/spanish-censor.png'
import spanishMilicianaPortrait from '../assets/images/mentors/spanish-miliciana.png'
import spanishCorresponsalPortrait from '../assets/images/mentors/spanish-corresponsal.png'
import spanishAbueloPortrait from '../assets/images/mentors/spanish-abuelo.png'

/**
 * Per-theme mentor "cast": four recurring in-world personas per theme,
 * each generated from the same character-roster art pass, each with their
 * own one-line backstory and their own reaction to exactly one kind of
 * review moment. Previously every theme had a single mentor voicing all
 * five moments — this spreads that voice across a small ensemble instead,
 * so a level-up, a hot streak, and a miss each get answered by a different
 * character rather than the same one wearing every hat. Purely flavor, no
 * mechanical effect.
 * @typedef {Object} MentorPersona
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} portrait
 * @property {string} backstory - one line, shown as a tooltip on the name
 * @property {string[]} lines
 * @property {string} [factionId] - the faction (see factions/factions.js) this
 *   persona is aligned with, if any — correctly recalling a word tied to
 *   this faction builds this persona's trust a little faster (see
 *   progression/affinity.js); not every persona has an aligned faction.
 */

/**
 * @typedef {Object} ThemeCast
 * @property {Record<'levelUp'|'streakUp'|'comboMilestone'|'miss'|'sessionComplete', MentorPersona>} personas
 */

/** @type {Record<string, ThemeCast>} */
const CASTS = {
  russian: {
    personas: {
      levelUp: {
        id: 'handler',
        factionId: 'nomenklatura',
        name: 'THE HANDLER',
        icon: '🕶',
        portrait: russianHandlerPortrait,
        backstory: 'A weary case officer three decades into a career that was supposed to last five years. Recruits everyone. Trusts no one. Secretly proud of the good ones.',
        lines: [
          'Moscow is watching. Your file grows heavier — good.',
          'Promotion noted. Do not let it go to your head, agent.',
          'Your clearance level rises. Ask no questions about why.',
        ],
      },
      streakUp: {
        id: 'cipherClerk',
        factionId: 'nomenklatura',
        name: 'THE CIPHER CLERK',
        icon: '🔍',
        portrait: russianCipherClerkPortrait,
        backstory: 'Logs every transmission that passes through the office by hand, in triplicate. Has not missed a shift in eleven years. Nobody remembers his first name.',
        lines: [
          'Consistency is the only virtue the Bureau rewards.',
          'A pattern this regular — either discipline, or you\'re being watched too.',
          'Keep this rhythm. Irregularity draws attention.',
        ],
      },
      comboMilestone: {
        id: 'defector',
        factionId: 'reformers',
        name: 'THE DEFECTOR',
        icon: '🥷',
        portrait: russianDefectorPortrait,
        backstory: 'Nobody agrees on which side he actually works for anymore, including possibly him. Appears only when something remarkable happens, then vanishes again.',
        lines: [
          'Five in a row. Even I noticed, and I notice nothing officially.',
          'Your hand does not shake. Good — it should never shake.',
        ],
        bountyLines: [
          'The field assignment is closed. I\'ll make sure it never officially existed.',
          'Intel delivered. Whoever asked for it will never know your name — that\'s the compliment.',
        ],
      },
      miss: {
        id: 'zealot',
        factionId: 'nomenklatura',
        name: 'THE ZEALOT',
        icon: '🚩',
        portrait: russianZealotPortrait,
        backstory: 'Joined the Party at sixteen and has never once questioned an order since. Reports mistakes as a matter of principle — including, if pressed, his own.',
        lines: [
          'A misstep. The Bureau does not forgive twice.',
          'Erase it from the record. Do not let it happen again.',
        ],
      },
      sessionComplete: {
        id: 'handler',
        factionId: 'nomenklatura',
        name: 'THE HANDLER',
        icon: '🕶',
        portrait: russianHandlerPortrait,
        backstory: 'A weary case officer three decades into a career that was supposed to last five years. Recruits everyone. Trusts no one. Secretly proud of the good ones.',
        lines: [
          'Shift complete. File it and go home, agent.',
          'Adequate work today. The Bureau expects more tomorrow.',
        ],
      },
    },
  },
  italian: {
    personas: {
      levelUp: {
        id: 'centurio',
        factionId: 'stoics',
        name: 'CENTVRIO AVLVS',
        icon: '⚔',
        portrait: italianCenturioPortrait,
        backstory: 'Rose through every rank the hard way, one campaign at a time. Runs his cohort like a family and disciplines them like one too.',
        lines: [
          'The Senate takes notice of your rise, soldier.',
          'Another rank earned. Rome does not promote the idle.',
          'You climb faster than most recruits. Do not grow careless.',
        ],
      },
      streakUp: {
        id: 'senator',
        name: 'THE SENATOR',
        icon: '🏛',
        portrait: italianSenatorPortrait,
        backstory: 'Has never held a sword in his life and considers that a point in his favor. Measures every soldier\'s worth in how useful they might someday be to him.',
        lines: [
          'A steady record. The Senate takes note of reliable men.',
          'Discipline like yours is rarer in the Curia than you\'d think.',
        ],
      },
      comboMilestone: {
        id: 'oracle',
        name: 'THE ORACLE',
        icon: '🔥',
        portrait: italianOraclePortrait,
        backstory: 'Speaks for the gods, or claims to, from a cave that always smells of smoke. Generals who ignore her have historically regretted it.',
        lines: [
          'Five victories unbroken — the smoke curls favorably tonight.',
          'The omens agree with your hand today. Do not test them further.',
        ],
        bountyLines: [
          'The assignment is fulfilled. The smoke saw it coming before you did.',
          'Rome asked for intelligence from the frontier — you delivered it. The gods take note of such things.',
        ],
      },
      miss: {
        id: 'gladiator',
        factionId: 'populares',
        name: 'THE GLADIATOR',
        icon: '🛡',
        portrait: italianGladiatorPortrait,
        backstory: 'Won his freedom in the arena and kept fighting anyway, because it was the only life he knew how to live. Blunt with everyone, including himself.',
        lines: [
          'Even Caesar lost a battle or two. Get back up.',
          'A fallen scout is not a fallen legion. Rise.',
        ],
      },
      sessionComplete: {
        id: 'centurio',
        factionId: 'stoics',
        name: 'CENTVRIO AVLVS',
        icon: '⚔',
        portrait: italianCenturioPortrait,
        backstory: 'Rose through every rank the hard way, one campaign at a time. Runs his cohort like a family and disciplines them like one too.',
        lines: [
          'Fall out, soldier. Rome will still be here tomorrow.',
          'A good drill. Rest — the frontier can wait.',
        ],
      },
    },
  },
  portuguese: {
    personas: {
      levelUp: {
        id: 'navigator',
        factionId: 'navigators',
        name: 'MESTRE HENRIQUE',
        icon: '🧭',
        portrait: portugueseNavigatorPortrait,
        backstory: 'Has crossed the same ocean so many times he claims to recognize individual waves. Trained half the pilots currently sailing under the crown\'s flag.',
        lines: [
          'The King himself will hear of this voyage, rapaz.',
          'Another rank at the Casa. You sail further than most pilots dare.',
          'Well charted. The crown rewards those who map the unknown.',
        ],
      },
      streakUp: {
        id: 'cartographer',
        factionId: 'navigators',
        name: 'THE CARTOGRAPHER',
        icon: '📐',
        portrait: portugueseCartographerPortrait,
        backstory: 'Has never set foot on a ship and never intends to. Draws coastlines from other men\'s memories, and gets them right more often than not.',
        lines: [
          'A steady wind, day after day — this is how empires are built.',
          'Hold this course. The compass has not lied to you yet.',
        ],
      },
      comboMilestone: {
        id: 'stowaway',
        name: 'THE STOWAWAY',
        icon: '🕳',
        portrait: portugueseStowawayPortrait,
        backstory: 'Nobody signed him onto the manifest and nobody has thrown him overboard either. Knows things about the crew that the crew would rather he didn\'t.',
        lines: [
          'Five true bearings running — even I noticed, and I notice everything.',
          'The stars themselves seem to favor you tonight.',
        ],
        bountyLines: [
          'Word from the far coast, delivered. I heard it through the hull before you even logged it.',
          'The crown wanted intelligence from unfamiliar waters. Consider it quietly arranged.',
        ],
      },
      miss: {
        id: 'priest',
        name: 'THE PRIEST',
        icon: '✝',
        portrait: portuguesePriestPortrait,
        backstory: 'Blesses every departing ship and privately doubts God hears him over the wind. Forgives easily, but keeps a private ledger of who needed it most.',
        lines: [
          'Every pilot drifts off course once. Correct and sail on.',
          'The sea forgives a wrong bearing, if you fix it in time.',
        ],
      },
      sessionComplete: {
        id: 'navigator',
        factionId: 'navigators',
        name: 'MESTRE HENRIQUE',
        icon: '🧭',
        portrait: portugueseNavigatorPortrait,
        backstory: 'Has crossed the same ocean so many times he claims to recognize individual waves. Trained half the pilots currently sailing under the crown\'s flag.',
        lines: [
          'Log it and rest, rapaz. The Atlantic will wait for dawn.',
          'A fair watch today. The Casa da Índia is pleased.',
        ],
      },
    },
  },
  french: {
    personas: {
      levelUp: {
        id: 'tribunal',
        factionId: 'jacobins',
        name: 'CITOYEN LAFORGE',
        icon: '⚖',
        portrait: frenchTribunalPortrait,
        backstory: 'A magistrate before the Revolution and a magistrate after it, having simply changed which portrait hangs behind his desk. Believes, mostly, in the process.',
        lines: [
          'The Convention notes your rise, citoyen. Liberty rewards diligence.',
          'Another rank earned — the Republic does not forget its servants.',
          'You climb the ranks faster than the tribunal\'s own clerks.',
        ],
      },
      streakUp: {
        id: 'pamphletaire',
        factionId: 'girondins',
        name: 'LE PAMPHLÉTAIRE',
        icon: '🖋',
        portrait: frenchPamphletairePortrait,
        backstory: 'Prints a new broadsheet every time he has an opinion, which is constantly. Half the city reads him. The other half burns him. He counts both as circulation.',
        lines: [
          'Consistency, citoyen — I\'m printing a column about it already.',
          'The Committee favors a steady hand over a brilliant but erratic one.',
        ],
      },
      comboMilestone: {
        id: 'sansCulotte',
        factionId: 'jacobins',
        name: 'LA SANS-CULOTTE',
        icon: '🚩',
        portrait: frenchSansCulottePortrait,
        backstory: 'Marched on the Bastille before she was old enough to vote and has not stopped marching since. Trusts the crowd more than any single leader, including herself.',
        lines: [
          'Five in a row! The whole street would cheer if they could see this.',
          'The crowd outside cheers your verdicts, citoyen.',
        ],
        bountyLines: [
          'The assignment is done, citoyen — I spread the word before the ink was even dry.',
          'Intelligence from the field! This is how the Republic actually wins.',
        ],
      },
      miss: {
        id: 'aristocrate',
        name: "L'ARISTOCRATE",
        icon: '💠',
        portrait: frenchAristocratePortrait,
        backstory: 'Lost the title, the estate, and most of the family, and kept the posture anyway. Surviving this long has made her harder to rattle than she looks.',
        lines: [
          'Even the finest orator stumbles once. Compose yourself.',
          'A single condemned word does not end the Republic. Continue.',
        ],
      },
      sessionComplete: {
        id: 'tribunal',
        factionId: 'jacobins',
        name: 'CITOYEN LAFORGE',
        icon: '⚖',
        portrait: frenchTribunalPortrait,
        backstory: 'A magistrate before the Revolution and a magistrate after it, having simply changed which portrait hangs behind his desk. Believes, mostly, in the process.',
        lines: [
          'The session adjourns, citoyen. Liberté awaits your return.',
          'A fair day\'s work for the Republic. Rest now.',
        ],
      },
    },
  },
  spanish: {
    personas: {
      levelUp: {
        id: 'censor',
        factionId: 'republicanos',
        name: 'EL CENSOR',
        icon: '✂',
        portrait: spanishCensorPortrait,
        backstory: 'Reads every dispatch twice before it leaves the office, once for facts and once for anything that might get him in trouble. Believes he is protecting people.',
        lines: [
          'The front hears of your work, compañero. Keep the presses running.',
          'Promoted. The cause needs disciplined hands like yours.',
          'Your dispatches climb the ranks. Don\'t let the censor slow you.',
        ],
      },
      streakUp: {
        id: 'corresponsal',
        factionId: 'exiliados',
        name: 'EL CORRESPONSAL EXTRANJERO',
        icon: '📷',
        portrait: spanishCorresponsalPortrait,
        backstory: 'Came for one story and stayed for three years, filing dispatches nobody back home fully believes. Keeps a bag packed by the door, just in case.',
        lines: [
          'Day after day at the desk — I\'ve seen fronts collapse for less discipline.',
          'Steady work, compañero. I\'m taking notes on you too.',
        ],
      },
      comboMilestone: {
        id: 'miliciana',
        factionId: 'republicanos',
        name: 'LA MILICIANA',
        icon: '✊',
        portrait: spanishMilicianaPortrait,
        backstory: 'Picked up a rifle the week the war started and has not put it down since. Younger than she looks in the photographs, and knows it.',
        lines: [
          'Five dispatches cleared without a mark! ¡Viva!',
          'The presses can barely keep up with you today.',
        ],
        bountyLines: [
          'Field assignment complete, compañera. ¡Viva! One less thing for the front to worry about.',
          'You went looking for it instead of waiting — that\'s what the cause actually needs.',
        ],
      },
      miss: {
        id: 'abuelo',
        factionId: 'exiliados',
        name: 'EL ABUELO',
        icon: '🕯',
        portrait: spanishAbueloPortrait,
        backstory: 'Too old to fight and too stubborn to leave, so he sits by the office stove and hands out advice nobody asked for. Usually right anyway.',
        lines: [
          'The censor rejects one dispatch — it happens. Redraft and send it again.',
          'I\'ve seen worse days than this one, hijo. Keep writing.',
        ],
      },
      sessionComplete: {
        id: 'censor',
        factionId: 'republicanos',
        name: 'EL CENSOR',
        icon: '✂',
        portrait: spanishCensorPortrait,
        backstory: 'Reads every dispatch twice before it leaves the office, once for facts and once for anything that might get him in trouble. Believes he is protecting people.',
        lines: [
          'Close the office, compañero. The front will still be there tomorrow.',
          'Good work at the desk today. Rest while you can.',
        ],
      },
    },
  },
}

/**
 * @param {string} themeId
 * @param {'levelUp'|'streakUp'|'comboMilestone'|'miss'|'sessionComplete'} moment
 * @returns {MentorPersona | undefined}
 */
export function getMentor(themeId, moment) {
  return CASTS[themeId]?.personas[moment]
}

/**
 * Picks a random line from the persona assigned to this theme+moment.
 * @param {string} themeId
 * @param {'levelUp'|'streakUp'|'comboMilestone'|'miss'|'sessionComplete'} moment
 * @param {() => number} [random] - returns a float in [0, 1); defaults to Math.random
 * @returns {string | null}
 */
export function pickMentorLine(themeId, moment, random = Math.random) {
  const pool = getMentor(themeId, moment)?.lines
  if (!pool || pool.length === 0) return null
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return pool[index]
}

/**
 * The persona who reacts to a completed daily field bounty — reuses each
 * theme's comboMilestone persona (the rare/mysterious one), since a
 * completed bounty is the same kind of infrequent, notable event.
 * @param {string} themeId
 * @returns {MentorPersona | undefined}
 */
export function getBountyMentor(themeId) {
  return getMentor(themeId, 'comboMilestone')
}

/**
 * Picks a random bounty-completion line for a theme's bounty mentor.
 * @param {string} themeId
 * @param {() => number} [random]
 * @returns {string | null}
 */
export function pickBountyLine(themeId, random = Math.random) {
  const pool = getBountyMentor(themeId)?.bountyLines
  if (!pool || pool.length === 0) return null
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return pool[index]
}

/**
 * Looks up a persona by its stable id rather than by moment — needed
 * wherever code only has a personaId on hand (e.g. an affinity record),
 * not the specific moment that happens to be showing it right now.
 * @param {string} themeId
 * @param {string} personaId
 * @returns {MentorPersona | undefined}
 */
export function getPersonaById(themeId, personaId) {
  const moments = ['levelUp', 'streakUp', 'comboMilestone', 'miss', 'sessionComplete']
  for (const moment of moments) {
    const persona = getMentor(themeId, moment)
    if (persona?.id === personaId) return persona
  }
  return undefined
}
