import russianHandlerPortrait from '../assets/images/mentors/russian-handler.png'
import italianCenturioPortrait from '../assets/images/mentors/italian-centurio.png'
import portugueseNavigatorPortrait from '../assets/images/mentors/portuguese-navigator.png'
import frenchTribunalPortrait from '../assets/images/mentors/french-tribunal.png'
import spanishCensorPortrait from '../assets/images/mentors/spanish-censor.png'

/**
 * Per-theme mentor NPCs: a recurring in-world voice that reacts to review
 * moments (leveling up, a streak growing, a combo milestone, a miss, a
 * session wrapping up) with short in-character lines. Purely flavor — no
 * mechanical effect — but it's the single cheapest way to make a mainframe
 * feel inhabited rather than a bare stat screen.
 *
 * Each mentor also has a hand-picked `portrait` from a larger generated
 * roster (5 themes × 4 personas each, see the project's mentor art prompts)
 * — one persona per theme chosen for the closest personality fit to the
 * lines already written here; the other three per theme are unused for now
 * but sit in src/assets/images/mentors/ as a ready bank for a future
 * multi-persona version of this system.
 * @typedef {Object} MentorDef
 * @property {string} name
 * @property {string} icon
 * @property {string} portrait
 * @property {Record<'levelUp'|'streakUp'|'comboMilestone'|'miss'|'sessionComplete', string[]>} lines
 */

/** @type {Record<string, MentorDef>} */
export const MENTORS = {
  russian: {
    name: 'THE HANDLER',
    icon: '🕶',
    portrait: russianHandlerPortrait,
    lines: {
      levelUp: [
        'Moscow is watching. Your file grows heavier — good.',
        'Promotion noted. Do not let it go to your head, agent.',
        'Your clearance level rises. Ask no questions about why.',
      ],
      streakUp: [
        'Consistency is the only virtue the Bureau rewards.',
        'A pattern this regular — either discipline, or you\'re being watched too.',
        'Keep this rhythm. Irregularity draws attention.',
      ],
      comboMilestone: [
        'Five in a row. The Directorate is taking notes.',
        'Your hand does not shake. Good — it should never shake.',
      ],
      miss: [
        'A misstep. Happens even to the best of us. Recompose.',
        'Erase it from the record. Try again.',
      ],
      sessionComplete: [
        'Shift complete. File it and go home, agent.',
        'Adequate work today. The Bureau expects more tomorrow.',
      ],
    },
  },
  italian: {
    name: 'CENTVRIO AVLVS',
    icon: '⚔',
    portrait: italianCenturioPortrait,
    lines: {
      levelUp: [
        'The Senate takes notice of your rise, soldier.',
        'Another rank earned. Rome does not promote the idle.',
        'You climb faster than most recruits. Do not grow careless.',
      ],
      streakUp: [
        'A legion marches on discipline, not glory. You have both today.',
        'Steady as a shield wall. Hold this line.',
      ],
      comboMilestone: [
        'Five victories unbroken! The eagle watches favorably.',
        'The cohort cheers your name, soldier.',
      ],
      miss: [
        'Even Caesar lost a battle or two. Regroup.',
        'A fallen scout is not a fallen legion. Rise.',
      ],
      sessionComplete: [
        'Fall out, soldier. Rome will still be here tomorrow.',
        'A good drill. Rest — the frontier can wait.',
      ],
    },
  },
  portuguese: {
    name: 'MESTRE HENRIQUE',
    icon: '🧭',
    portrait: portugueseNavigatorPortrait,
    lines: {
      levelUp: [
        'The King himself will hear of this voyage, rapaz.',
        'Another rank at the Casa. You sail further than most pilots dare.',
        'Well charted. The crown rewards those who map the unknown.',
      ],
      streakUp: [
        'A steady wind, day after day — this is how empires are built.',
        'Hold this course. The compass has not lied to you yet.',
      ],
      comboMilestone: [
        'Five true bearings running! The crew trusts your hand on the wheel.',
        'The stars themselves seem to favor you tonight.',
      ],
      miss: [
        'Every pilot drifts off course once. Correct and sail on.',
        'The sea forgives a wrong bearing, if you fix it in time.',
      ],
      sessionComplete: [
        'Log it and rest, rapaz. The Atlantic will wait for dawn.',
        'A fair watch today. The Casa da Índia is pleased.',
      ],
    },
  },
  french: {
    name: 'CITOYEN LAFORGE',
    icon: '⚖',
    portrait: frenchTribunalPortrait,
    lines: {
      levelUp: [
        'The Convention notes your rise, citoyen. Liberty rewards diligence.',
        'Another rank earned — the Republic does not forget its servants.',
        'You climb the ranks faster than the tribunal\'s own clerks.',
      ],
      streakUp: [
        'Consistency, citoyen — the surest proof of true republican virtue.',
        'The Committee favors a steady hand over a brilliant but erratic one.',
      ],
      comboMilestone: [
        'Five acquittals in a row! The tribunal is, for once, impressed.',
        'The crowd outside cheers your verdicts, citoyen.',
      ],
      miss: [
        'Even the finest orator stumbles once. Compose yourself.',
        'A single condemned word does not end the Republic. Continue.',
      ],
      sessionComplete: [
        'The session adjourns, citoyen. Liberté awaits your return.',
        'A fair day\'s work for the Republic. Rest now.',
      ],
    },
  },
  spanish: {
    name: 'LA COMISARIA',
    icon: '✊',
    portrait: spanishCensorPortrait,
    lines: {
      levelUp: [
        'The front hears of your work, compañero. Keep the presses running.',
        'Promoted. The cause needs disciplined hands like yours.',
        'Your dispatches climb the ranks. Don\'t let the censor slow you.',
      ],
      streakUp: [
        'Day after day at the desk — this is what solidarity looks like.',
        'Steady work, compañero. The front depends on it.',
      ],
      comboMilestone: [
        'Five dispatches cleared without a mark! The office is proud.',
        'The presses can barely keep up with you today.',
      ],
      miss: [
        'The censor rejects one dispatch — it happens. Redraft and send it again.',
        'No one wins every round with the censor. Keep writing.',
      ],
      sessionComplete: [
        'Close the office, compañero. The front will still be there tomorrow.',
        'Good work at the desk today. Rest while you can.',
      ],
    },
  },
}

/**
 * @param {string} themeId
 * @returns {MentorDef | undefined}
 */
export function getMentor(themeId) {
  return MENTORS[themeId]
}

/**
 * Picks a random line for a theme's mentor and trigger moment.
 * @param {string} themeId
 * @param {'levelUp'|'streakUp'|'comboMilestone'|'miss'|'sessionComplete'} moment
 * @param {() => number} [random] - returns a float in [0, 1); defaults to Math.random
 * @returns {string | null}
 */
export function pickMentorLine(themeId, moment, random = Math.random) {
  const mentor = MENTORS[themeId]
  const pool = mentor?.lines[moment]
  if (!pool || pool.length === 0) return null
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return pool[index]
}
