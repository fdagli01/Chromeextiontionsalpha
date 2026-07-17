/**
 * NPC intercepts: once in a while a persona steps between the player and an
 * ordinary review card and makes it personal — the defector needs THIS word
 * decoded to cross the border, the captain needs THIS chart note confirmed
 * before the rocks. The word, the answer options, and the FSRS grading are
 * all exactly the normal review flow; the intercept is a narrative frame
 * with real (but bounded) stakes layered on top: persona trust and a little
 * bonus XP ride on the outcome.
 *
 * One deliberate exception: the French encounter inverts the morality. The
 * condemned aristocrat BEGS you to answer wrong. Failing on purpose earns
 * her gratitude (trust + "gold" XP) but the miss is still a real FSRS miss
 * — the scheduler doesn't care about your conscience. Answering correctly
 * earns the tribunal's respect instead. A genuine dilemma, not a fake one.
 */

/** Chance that a freshly-shown due card arrives as an intercept. */
export const INTERCEPT_ENCOUNTER_CHANCE = 0.05

/** Bonus XP for resolving an intercept the way its persona hoped. */
export const INTERCEPT_BONUS_XP = 10

/**
 * @typedef {Object} InterceptDef
 * @property {string} themeId
 * @property {string} personaId - who steps into frame (see mentors.js casts)
 * @property {string} title - the in-world document/frame heading
 * @property {(term: string) => string} plea - what the persona asks, with the term embedded
 * @property {string} successLine - persona's reaction when the player does what they hoped
 * @property {string} failLine - persona's reaction otherwise
 * @property {number} [timerSec] - Spanish only: answer within this or the moment is lost
 * @property {boolean} [shipShake] - Portuguese only: storm-shake the screen while active
 * @property {boolean} [moralInversion] - French only: the persona WANTS a wrong answer
 */

/** @type {Record<string, InterceptDef>} */
export const INTERCEPTS = {
  russian: {
    themeId: 'russian',
    personaId: 'defector',
    title: 'BORDER TRANSIT PAPERS',
    plea: (term) =>
      `Comrade — they are close behind me. Decode "${term}" from this intelligence file in one attempt and I make it across the border tonight.`,
    successLine: 'The stamp falls. By the time they check this checkpoint, I never existed. I owe you.',
    failLine: 'The guards are turning this way... forget my face. We never spoke.',
  },
  spanish: {
    themeId: 'spanish',
    personaId: 'miliciana',
    title: 'RADIO INTERCEPT — URGENT',
    plea: (term) =>
      `¡Cuartel! I can't make out the transmission — confirm the meaning of "${term}" NOW or the trench line falls!`,
    successLine: 'Confirmed and relayed! The line holds — good work, compañero.',
    failLine: 'Static... we lost the window. Hold your position, we go again tomorrow.',
    timerSec: 10,
  },
  french: {
    themeId: 'french',
    personaId: 'aristocrate',
    title: 'ORDER OF THE GUILLOTINE',
    plea: (term) =>
      `Clerk — I will pay you in gold. Write the meaning of "${term}" WRONG in the record, just this once, and the blade passes over me.`,
    successLine: 'So you side with the mob after all. How very... virtuous of you, clerk.',
    failLine: 'Bless you, clerk. The record is flawed, the sentence commuted — my gold is yours.',
    moralInversion: true,
  },
  italian: {
    themeId: 'italian',
    personaId: 'senator',
    title: 'SENATE MOTION — EMERGENCY SESSION',
    plea: (term) =>
      `The barbarians are at the frontier, archivist. Confirm the meaning of "${term}" in this decree so the legions can march before sundown.`,
    successLine: 'The motion carries. A sestertius for your trouble — Rome remembers small services.',
    failLine: 'The session dissolves into shouting. The legions wait another day. Disappointing.',
  },
  portuguese: {
    themeId: 'portuguese',
    personaId: 'navigator',
    title: "CHART ANNOTATION — CAPTAIN'S ORDERS",
    plea: (term) =>
      `Storm on the bow, rapaz! Confirm what "${term}" marks on this chart or we find the rocks the hard way!`,
    successLine: 'Hard to port — we clear the shoals! Steady hands, rapaz. Log it.',
    failLine: 'We scrape through on luck alone. Luck is not seamanship. Study the chart.',
    shipShake: true,
  },
}

/**
 * Rolls whether the next due card arrives as an intercept encounter.
 * @param {string} themeId
 * @param {() => number} [random]
 * @returns {InterceptDef | null}
 */
export function rollIntercept(themeId, random = Math.random) {
  const def = INTERCEPTS[themeId]
  if (!def) return null
  return random() < INTERCEPT_ENCOUNTER_CHANCE ? def : null
}

/**
 * Maps a graded answer to the intercept's outcome. For every theme except
 * French, "correct" is what the persona hoped for. The French aristocrat
 * hoped for the opposite — so a miss is her win, and the trust/XP flow to
 * her, while a correct answer is a (smaller) win in the tribunal's eyes.
 * @param {InterceptDef} def
 * @param {boolean} correct
 * @returns {{personaHelped: boolean, line: string, trustDelta: number, bonusXp: number, creditPersonaId: string}}
 */
export function resolveIntercept(def, correct) {
  if (def.moralInversion) {
    if (!correct) {
      return { personaHelped: true, line: def.failLine, trustDelta: 3, bonusXp: 15, creditPersonaId: def.personaId }
    }
    // Refusing the bribe impresses the tribunal side of the cast instead.
    return { personaHelped: false, line: def.successLine, trustDelta: 2, bonusXp: INTERCEPT_BONUS_XP, creditPersonaId: 'tribunal' }
  }
  if (correct) {
    return { personaHelped: true, line: def.successLine, trustDelta: 2, bonusXp: INTERCEPT_BONUS_XP, creditPersonaId: def.personaId }
  }
  return { personaHelped: false, line: def.failLine, trustDelta: -1, bonusXp: 0, creditPersonaId: def.personaId }
}
