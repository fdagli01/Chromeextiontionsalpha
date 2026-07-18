import { getAffinityRecordsForTheme } from '../db/affinityRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { awardReputation } from '../db/factionsRepo.js'
import { awardBonusXp } from '../xp/xpService.js'
import { addTrust, tierForTrust } from './affinity.js'
import { recordDecision } from './decisions.js'

/**
 * Story scenes: the RPG layer. When a persona's trust crosses into Warm or
 * Ally, their personal story advances — a one-time scene interrupts the
 * flow with a confession, a request, a test. Every scene ends in a choice
 * with real mechanical teeth (trust, faction reputation, XP), and the
 * choice is written permanently into the decision journal, where later
 * mentor lines (and eventually endings) will find it.
 *
 * Scene pending-ness is pure derivation: affinity tier reached AND no
 * journal entry for the scene yet. No new store, no unlock flags.
 * @typedef {Object} SceneChoice
 * @property {string} id
 * @property {string} label - the button text, in the player's voice
 * @property {string} response - the persona's reaction, shown after choosing
 * @property {{trust?: {personaId: string, delta: number}, reputation?: {factionId: string, delta: number}, xp?: number}} [effects]
 * @typedef {Object} StoryScene
 * @property {string} id
 * @property {string} themeId
 * @property {string} personaId
 * @property {'warm'|'ally'} tier - trust tier that unlocks the scene
 * @property {string} title
 * @property {string} body - the persona's words, 2-4 sentences
 * @property {SceneChoice[]} choices
 */

const TIER_ORDER = ['suspicious', 'neutral', 'warm', 'ally']

/** @type {Record<string, StoryScene[]>} */
export const STORY_SCENES = {
  russian: [
    {
      id: 'ru-handler-warm',
      themeId: 'russian',
      personaId: 'handler',
      tier: 'warm',
      title: 'AFTER HOURS',
      body: 'The Handler waits until the floor empties, then sets two glasses on your desk. "Twenty years I have run assets in this building. I trust exactly none of them. You — you file clean work. So tell me, clerk: do you work for the language, or for the Party?"',
      choices: [
        {
          id: 'language',
          label: 'For the language. The Party is temporary.',
          response: '"Dangerous answer." He drinks. "Correct answer. We never spoke." He leaves the second glass full — for you.',
          effects: { trust: { personaId: 'handler', delta: 3 }, xp: 15 },
        },
        {
          id: 'party',
          label: 'For the Party, comrade. Always.',
          response: '"Of course you do." He pockets the glasses, unimpressed but reassured. The Nomenklatura notes your loyalty.',
          effects: { reputation: { factionId: 'nomenklatura', delta: 15 }, trust: { personaId: 'handler', delta: 1 } },
        },
      ],
    },
    {
      id: 'ru-handler-ally',
      themeId: 'russian',
      personaId: 'handler',
      tier: 'ally',
      title: 'THE UNMARKED FILE',
      body: '"There is a file with no case number. Names of people this office disappeared — including two I reported myself, back when I believed. I am old. Someone should hold it when I am gone." He slides it across the desk without looking at you.',
      choices: [
        {
          id: 'keep',
          label: 'Take the file. Some records must survive.',
          response: '"Then it is done." His shoulders drop an inch — twenty years of weight moving to yours. "Study your words, clerk. Words are how they will remember any of us."',
          effects: { trust: { personaId: 'handler', delta: 3 }, reputation: { factionId: 'reformers', delta: 15 }, xp: 25 },
        },
        {
          id: 'burn',
          label: 'Burn it. The past protects no one.',
          response: 'He watches it curl in the ashtray. "Perhaps you are the wiser of us." The Party never learns the file existed — and neither will anyone else.',
          effects: { reputation: { factionId: 'nomenklatura', delta: 15 }, trust: { personaId: 'handler', delta: 1 }, xp: 10 },
        },
      ],
    },
    {
      id: 'ru-cipherclerk-warm',
      themeId: 'russian',
      personaId: 'cipherClerk',
      tier: 'warm',
      title: 'AN IRREGULARITY',
      body: 'The Cipher Clerk finds you at the archive, clutching a decrypt. "This intercept — the grammar is wrong. Deliberately wrong. Someone inside is passing messages in broken syntax and my superiors call it noise. You know the language better than they do. Tell me I am not mad."',
      choices: [
        {
          id: 'confirm',
          label: 'You are not mad. That is a code inside the code.',
          response: '"I KNEW it." He is already rewriting his report. Your name goes in the footnote — which, from him, is a medal.',
          effects: { trust: { personaId: 'cipherClerk', delta: 3 }, xp: 20 },
        },
        {
          id: 'dismiss',
          label: 'It is noise. Sleep more, decrypt less.',
          response: 'He deflates, files the decrypt under MISCELLANEOUS, and does not mention it again. Three weeks later the mole defects. He never looks at you quite the same.',
          effects: { trust: { personaId: 'cipherClerk', delta: -2 }, xp: 5 },
        },
      ],
    },
    {
      id: 'ru-cipherclerk-ally',
      themeId: 'russian',
      personaId: 'cipherClerk',
      tier: 'ally',
      title: 'THE PERSONAL CIPHER',
      body: '"I built a cipher no directorate can break. I have never told anyone it exists. If something happens to me, messages will come to you in it — here is the key. Memorize it and eat the paper. I am not joking. The paper is rice. I tested it."',
      choices: [
        {
          id: 'memorize',
          label: 'Memorize the key. Eat the paper.',
          response: 'It tastes like glue and secrets. "Good," he says, satisfied. "Now there are two people in the world worth writing to."',
          effects: { trust: { personaId: 'cipherClerk', delta: 3 }, xp: 25 },
        },
        {
          id: 'refuse',
          label: 'Refuse. Secrets that size get people shot.',
          response: '"Sensible. Cowardly, but sensible." He eats the paper himself, chewing with reproach. The offer never comes again.',
          effects: { trust: { personaId: 'cipherClerk', delta: -1 }, reputation: { factionId: 'nomenklatura', delta: 10 } },
        },
      ],
    },
    {
      id: 'ru-defector-warm',
      themeId: 'russian',
      personaId: 'defector',
      tier: 'warm',
      title: 'WHAT HE LEFT BEHIND',
      body: 'The Defector speaks quietly, eyes on the door. "My sister is still in Moscow. There is a man who forges exit papers — he owes me. But someone must carry her name to him, someone with archive access whose movements are not watched. I cannot ask this. I am asking this."',
      choices: [
        {
          id: 'carry',
          label: 'Carry the name. Family is not treason.',
          response: '"I will not forget this. Defectors forget nothing — it is all we have left." Weeks later, a postcard with no signature: a seaside town, one word. "Спасибо."',
          effects: { trust: { personaId: 'defector', delta: 3 }, reputation: { factionId: 'nomenklatura', delta: -10 }, xp: 25 },
        },
        {
          id: 'refuse',
          label: 'Refuse. You will not risk the archive for one name.',
          response: 'He nods slowly, as if confirming an old suspicion about people. "The archive. Yes. Guard your papers, clerk." He never mentions her again, which is worse than if he did.',
          effects: { trust: { personaId: 'defector', delta: -2 }, reputation: { factionId: 'nomenklatura', delta: 10 } },
        },
      ],
    },
    {
      id: 'ru-defector-ally',
      themeId: 'russian',
      personaId: 'defector',
      tier: 'ally',
      title: 'THE OFFER',
      body: '"There is a seat on a truck crossing the border on Thursday. I bought two. I am telling you because you are the only one here who ever treated me as a person and not a filing error. Come with me, or stay and become what this building makes of people. Either way — decide as yourself, not as a clerk."',
      choices: [
        {
          id: 'stay',
          label: 'Stay. The words in this archive still need a witness.',
          response: '"A witness." He tries the word like a foreign phrase, then smiles for the first time you can remember. "Then witness well. I will read about you someday — in whichever language wins."',
          effects: { trust: { personaId: 'defector', delta: 2 }, xp: 30 },
        },
        {
          id: 'someday',
          label: 'Not Thursday. But keep a seat warm — someday.',
          response: '"Someday." He writes an address on your palm rather than paper. "It is a real place. The door is never locked to you." The ink outlasts three washings.',
          effects: { trust: { personaId: 'defector', delta: 3 }, reputation: { factionId: 'reformers', delta: 10 }, xp: 15 },
        },
      ],
    },
    {
      id: 'ru-zealot-warm',
      themeId: 'russian',
      personaId: 'zealot',
      tier: 'warm',
      title: 'A CRACK IN THE DOCTRINE',
      body: 'The Zealot corners you, manifesto in hand, voice lower than you have ever heard it. "Page forty. The passage on sacrifice. I have read it four hundred times and last night, for the first time — I read it as a threat and not a promise. Tell me honestly, as a student of words: is it possible to misread something four hundred times?"',
      choices: [
        {
          id: 'honest',
          label: 'Yes. The words did not change. You did.',
          response: 'A long silence. "Then I must decide which of us is right — the man who read it four hundred times, or the one reading it now." He shakes your hand, formally, like a man beginning a long journey.',
          effects: { trust: { personaId: 'zealot', delta: 3 }, reputation: { factionId: 'reformers', delta: 10 }, xp: 20 },
        },
        {
          id: 'comfort',
          label: 'You are tired. The doctrine is sound. Sleep.',
          response: 'Relief floods his face — and something behind the relief dims. "Yes. Tired. Thank you, comrade." He resumes quoting page forty at meetings. He never asks you anything real again.',
          effects: { trust: { personaId: 'zealot', delta: 1 }, reputation: { factionId: 'nomenklatura', delta: 10 } },
        },
      ],
    },
    {
      id: 'ru-zealot-ally',
      themeId: 'russian',
      personaId: 'zealot',
      tier: 'ally',
      title: 'THE ANNOTATED EDITION',
      body: '"I am writing in the margins now. My own words, next to the doctrine. Do you understand what that means? If they find it, the margins alone are ten years. I want one other person to know it exists. Not to read it — just to know. A book no one knows about is only paper."',
      choices: [
        {
          id: 'witness',
          label: 'I know it exists. That makes it a book.',
          response: '"Yes. Exactly. A book." He holds it slightly differently now — like a thing with weight. "When it is finished, you read it first. Argue with every page. That is what margins are FOR."',
          effects: { trust: { personaId: 'zealot', delta: 3 }, xp: 25 },
        },
        {
          id: 'warn',
          label: 'Burn the margins. Keep the thoughts. Stay alive.',
          response: '"Spoken like the Handler." It is not entirely an insult. He burns nothing, but he buys a second, cleaner copy for meetings — your caution, his conviction, split across two bindings.',
          effects: { trust: { personaId: 'zealot', delta: 2 }, reputation: { factionId: 'nomenklatura', delta: 5 }, xp: 10 },
        },
      ],
    },
  ],
  french: [
    {
      id: 'fr-tribunal-warm',
      themeId: 'french',
      personaId: 'tribunal',
      tier: 'warm',
      title: 'A NAME TOO MANY',
      body: 'Citizen Laforge stops you after session, docket in hand. "Tomorrow\'s list has forty names. The fortieth is a laundress who taught my daughter to read. Her crime is a letter she carried unread. I have voided royal decrees, clerk — but a tribunal clerk who voids a revolutionary docket signs himself onto the next one. Unless the record were to contain... an irregularity of spelling."',
      choices: [
        {
          id: 'misfile',
          label: 'Misspell the name. Let the docket miss her.',
          response: '"What laundress? The record shows no such person." He signs the corrected docket without blinking. Thirty-nine names. He owes you a debt no court can hear.',
          effects: { trust: { personaId: 'tribunal', delta: 3 }, reputation: { factionId: 'jacobins', delta: -10 }, xp: 25 },
        },
        {
          id: 'refuse',
          label: 'The record is the record. Forty names.',
          response: 'He nods once, jaw tight. "The record is the record. You will make an excellent clerk of the Terror." From him, tonight, that is not praise.',
          effects: { trust: { personaId: 'tribunal', delta: -1 }, reputation: { factionId: 'jacobins', delta: 15 } },
        },
      ],
    },
    {
      id: 'fr-tribunal-ally',
      themeId: 'french',
      personaId: 'tribunal',
      tier: 'ally',
      title: 'THE LIST WITH HIS NAME',
      body: '"They are drafting my arrest. Wednesday, I am told, after I sign the week\'s dockets — my signature legitimizes theirs one final time. I could run tonight. Or I could sit Wednesday and make them explain, in open session and in correct legal French, why the Revolution eats its clerks. You keep the record. What should the record show?"',
      choices: [
        {
          id: 'stand',
          label: 'Sit Wednesday. Make the record remember them.',
          response: '"Then Wednesday it is." He spends the night correcting the grammar of his own indictment — "if it must exist, it will at least be well written." The record you keep of that session outlives every man in the room.',
          effects: { trust: { personaId: 'tribunal', delta: 3 }, reputation: { factionId: 'girondins', delta: 15 }, xp: 30 },
        },
        {
          id: 'run',
          label: 'Run tonight. Dead clerks correct nothing.',
          response: '"A living coward and a dead clerk agree on remarkably little — but they agree on this." He leaves you his seal, cracked in half: "For the record. Whichever half of me you choose to remember."',
          effects: { trust: { personaId: 'tribunal', delta: 2 }, xp: 20 },
        },
      ],
    },
    {
      id: 'fr-pamphletaire-warm',
      themeId: 'french',
      personaId: 'pamphletaire',
      tier: 'warm',
      title: 'THE RETRACTION',
      body: 'The Pamphlétaire finds you, ink to the elbows, holding two versions of tomorrow\'s front page. "Version one: the bread riots were provoked by royalist agents — it will sell four thousand copies and it is a lie. Version two: the bread simply ran out — true, dull, and it will sell four hundred. My printer is waiting. Which France do we publish?"',
      choices: [
        {
          id: 'truth',
          label: 'Print the truth. Four hundred honest readers.',
          response: '"Four hundred and ONE — I will read it myself, weeping over my lost circulation." He prints it. It sells nine hundred. He never lets you forget the extra five hundred were "loyalty to the brand."',
          effects: { trust: { personaId: 'pamphletaire', delta: 3 }, reputation: { factionId: 'girondins', delta: 10 }, xp: 20 },
        },
        {
          id: 'lie',
          label: 'Print the agents. The Revolution needs villains.',
          response: '"Four thousand copies of a useful lie." He prints it with a showman\'s flourish and does not meet your eye. The Jacobin clubs quote it for a month. He starts keeping a private notebook labeled ERRATA.',
          effects: { trust: { personaId: 'pamphletaire', delta: 1 }, reputation: { factionId: 'jacobins', delta: 15 } },
        },
      ],
    },
    {
      id: 'fr-pamphletaire-ally',
      themeId: 'french',
      personaId: 'pamphletaire',
      tier: 'ally',
      title: 'THE ERRATA NOTEBOOK',
      body: '"Every lie I ever printed, corrected in my own hand — dates, names, what actually happened. If I die famous, this notebook makes me infamous, which is the only honest kind of famous. My printer refuses to touch it. So: will you keep the errata of the Revolution, clerk? It is heavier than it looks."',
      choices: [
        {
          id: 'keep',
          label: 'Keep it. Corrections are a second Revolution.',
          response: '"A SECOND revolution — oh, that is good, I am stealing that for the preface." He inscribes it to you: "To the keeper of the true edition." It is the only page in the book with no corrections.',
          effects: { trust: { personaId: 'pamphletaire', delta: 3 }, reputation: { factionId: 'girondins', delta: 10 }, xp: 25 },
        },
        {
          id: 'publish',
          label: 'Do not archive it — publish it. Now. While it matters.',
          response: 'He goes pale, then grins like a man diagnosed with his own medicine. "Now. While it matters. You are worse than I am." The errata run as a serial. Circulation triples. So do his enemies.',
          effects: { trust: { personaId: 'pamphletaire', delta: 2 }, reputation: { factionId: 'jacobins', delta: -10 }, xp: 30 },
        },
      ],
    },
    {
      id: 'fr-sansculotte-warm',
      themeId: 'french',
      personaId: 'sansCulotte',
      tier: 'warm',
      title: 'THE LETTER SHE CANNOT SEND',
      body: 'La Sans-Culotte thrusts a paper at you, chin high, daring you to comment. "My brother marches with the Vendée rebels. Wrong side, wrong cause, my own blood. I dictated a letter telling him to come home before the columns reach him. The section committee reads all post to the Vendée. You know how officials write — make my letter boring enough to survive the censor."',
      choices: [
        {
          id: 'rewrite',
          label: 'Rewrite it as a dull family matter. It will pass.',
          response: 'You bury "come home before the soldiers come" inside chatter about a sick aunt and a disputed inheritance. The censor stamps it unread. Two months later she tells you, roughly, that her brother is peeling potatoes in her kitchen — "the aunt recovered."',
          effects: { trust: { personaId: 'sansCulotte', delta: 3 }, reputation: { factionId: 'jacobins', delta: -5 }, xp: 25 },
        },
        {
          id: 'refuse',
          label: 'Refuse. Letters to the Vendée endanger you both.',
          response: 'She takes the letter back without a word and sends it as written. It is opened, logged, and filed against her name. Nothing happens — yet. She still shares her bread with you, but she counts the pieces now.',
          effects: { trust: { personaId: 'sansCulotte', delta: -2 }, reputation: { factionId: 'jacobins', delta: 10 } },
        },
      ],
    },
    {
      id: 'fr-sansculotte-ally',
      themeId: 'french',
      personaId: 'sansCulotte',
      tier: 'ally',
      title: 'READING LESSONS',
      body: 'She corners you at the section hall, arms crossed, furious at her own request. "Teach me to read. Properly — not signs and slogans, BOOKS. The Revolution says I am a citizen; a citizen who cannot read the laws is a citizen only on market days. One condition: no one knows. The day someone laughs, the lessons end and so do you."',
      choices: [
        {
          id: 'teach',
          label: 'Teach her. Tuesdays, before dawn, no witnesses.',
          response: 'She learns the way she does everything — like a street fight. Within a season she is correcting the Pamphlétaire\'s grammar in public. She never admits where she learned. He never asks. Everyone knows.',
          effects: { trust: { personaId: 'sansCulotte', delta: 3 }, xp: 30 },
        },
        {
          id: 'primer',
          label: 'Give her the primer and the plan. She teaches herself.',
          response: '"A book and a map of the book. Yes. Better." Pride intact, she devours it alone by candle-ends. The first thing she writes unaided is a note left on your desk: three words, two spelled wrong, worth keeping forever.',
          effects: { trust: { personaId: 'sansCulotte', delta: 2 }, reputation: { factionId: 'jacobins', delta: 5 }, xp: 20 },
        },
      ],
    },
    {
      id: 'fr-aristocrate-warm',
      themeId: 'french',
      personaId: 'aristocrate',
      tier: 'warm',
      title: 'THE INVENTORY',
      body: 'The Aristocrate receives you as if the cell were a salon. "They inventory my property tomorrow. Most of it may burn, frankly — but there is a library. Four hundred volumes, six languages, three centuries. The Republic will pulp them for cartridge paper. You are a clerk of words; I am asking you to misplace a library. Steal knowledge, citizen. It is the only theft with a clean conscience."',
      choices: [
        {
          id: 'misplace',
          label: 'Reroute the library to the public archive. All of it.',
          response: '"The PUBLIC archive. Oh, that is vicious — my grandfather\'s books, taught to read by fishwives\' children." She laughs until she coughs. "Perfect. He would have hated it. Proceed, citizen."',
          effects: { trust: { personaId: 'aristocrate', delta: 3 }, reputation: { factionId: 'girondins', delta: 10 }, xp: 25 },
        },
        {
          id: 'protocol',
          label: 'The inventory stands. The Republic decides its own paper.',
          response: '"Cartridge paper, then. Montaigne will be fired at Austrians." She turns to the window. "Do you know, clerk, that is the first genuinely revolutionary thing I have heard anyone say. I despise it completely."',
          effects: { trust: { personaId: 'aristocrate', delta: -1 }, reputation: { factionId: 'jacobins', delta: 15 } },
        },
      ],
    },
    {
      id: 'fr-aristocrate-ally',
      themeId: 'french',
      personaId: 'aristocrate',
      tier: 'ally',
      title: 'THE LAST LESSON',
      body: 'Her sentence is confirmed for Thursday. She summons you with the guard she has somehow befriended. "No rescue, no bribe — we are past that, and my gold is spent on worse clerks than you. A last lesson instead. My family motto is fourteen words of very bad medieval French. Learn it from me now, correctly, and say it back once. Languages die when the last careless speaker forgets them. I would prefer to be survived by a careful one."',
      choices: [
        {
          id: 'learn',
          label: 'Learn it. Say it back perfectly.',
          response: 'You repeat the fourteen words. She corrects your vowels twice, then nods — satisfied, complete. "There. Now it outlives the guillotine by exactly one clerk." Thursday, she goes up the steps re-pinning her hair, unhurried. You never misplace the words.',
          effects: { trust: { personaId: 'aristocrate', delta: 3 }, xp: 35 },
        },
        {
          id: 'write',
          label: 'Learn it — and write it into the archive, attributed.',
          response: '"Attributed? In a REPUBLICAN archive?" For one unguarded moment she looks young. "Then I am a source. How appallingly permanent." She dictates it twice more to be certain of the spelling, imperious to the last comma.',
          effects: { trust: { personaId: 'aristocrate', delta: 2 }, reputation: { factionId: 'girondins', delta: 15 }, xp: 25 },
        },
      ],
    },
  ],
}

/**
 * A decision the world remembers out loud: occasional mentor-line
 * replacements that reference a journal entry, delivered by the persona
 * the decision touched. One line per (decision, choice) pair that has a
 * voice worth hearing again.
 * @type {Array<{themeId: string, decisionId: string, choiceId: string, personaId: string, line: string}>}
 */
export const DECISION_CALLOUTS = [
  { themeId: 'russian', decisionId: 'scene:ru-defector-warm', choiceId: 'carry', personaId: 'defector', line: 'The seaside postcard came again. No signature. She is well. You did that, clerk.' },
  { themeId: 'russian', decisionId: 'scene:ru-defector-warm', choiceId: 'refuse', personaId: 'defector', line: 'Your papers are safe, clerk. I remember how much that matters to you.' },
  { themeId: 'russian', decisionId: 'scene:ru-handler-warm', choiceId: 'party', personaId: 'handler', line: 'Still working for the Party, clerk? The Party thanks you. The Party always thanks you. Until it doesn\'t.' },
  { themeId: 'russian', decisionId: 'scene:ru-zealot-warm', choiceId: 'comfort', personaId: 'zealot', line: 'Page forty is very clear, comrade. I no longer read it at night. Thank you for that.' },
  { themeId: 'russian', decisionId: 'scene:ru-cipherclerk-warm', choiceId: 'dismiss', personaId: 'cipherClerk', line: 'You remember the "noise" in that intercept? Of course you do. So do I. Every day.' },
  { themeId: 'french', decisionId: 'french-bribe', choiceId: 'accepted', personaId: 'tribunal', line: 'The record from that day still reads strangely, clerk. Gold buys ink. It does not buy my memory.' },
  { themeId: 'french', decisionId: 'french-bribe', choiceId: 'refused', personaId: 'aristocrate', line: 'You once refused my gold, citizen. I have decided to find that admirable. It took some time.' },
  { themeId: 'french', decisionId: 'scene:fr-tribunal-warm', choiceId: 'misfile', personaId: 'tribunal', line: 'The laundress sends bread to the tribunal kitchens now. No one knows why. Two of us do.' },
  { themeId: 'french', decisionId: 'scene:fr-tribunal-warm', choiceId: 'refuse', personaId: 'tribunal', line: 'Forty names that week. The record is the record — you taught me you believe that.' },
  { themeId: 'french', decisionId: 'scene:fr-pamphletaire-warm', choiceId: 'lie', personaId: 'pamphletaire', line: 'The clubs are STILL quoting our royalist-agents piece. Journalism! I have added it to a certain notebook.' },
  { themeId: 'russian', decisionId: 'contraband-sale', choiceId: 'sold', personaId: 'handler', line: 'The black market speaks well of you, clerk. That is not a compliment I would repeat upstairs.' },
]

/**
 * The next story scene owed to the player in this theme, or null. A scene
 * is pending when its persona's trust has reached the required tier and
 * its outcome is not yet in the decision journal. Returned one at a time,
 * lowest tier first, so back-to-back unlocks queue naturally.
 * @param {string} themeId
 * @returns {Promise<StoryScene | null>}
 */
export async function getPendingScene(themeId) {
  const scenes = STORY_SCENES[themeId]
  if (!scenes || scenes.length === 0) return null
  const [records, progress] = await Promise.all([
    getAffinityRecordsForTheme(themeId),
    getProgress(themeId),
  ])
  const done = new Set(progress.decisions.map((d) => d.id))
  const byTier = [...scenes].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  )
  for (const scene of byTier) {
    if (done.has(`scene:${scene.id}`)) continue
    const record = records.find((r) => r.personaId === scene.personaId)
    if (!record) continue
    const reached = TIER_ORDER.indexOf(tierForTrust(record.trust).id)
    if (reached >= TIER_ORDER.indexOf(scene.tier)) return scene
  }
  return null
}

/**
 * Applies a scene choice: journal first (so a crash can never replay the
 * scene), then the mechanical effects.
 * @param {string} themeId
 * @param {StoryScene} scene
 * @param {SceneChoice} choice
 * @returns {Promise<{response: string, progress: import('../db/progressRepo.js').ThemeProgress | null}>}
 */
export async function resolveSceneChoice(themeId, scene, choice) {
  await recordDecision(themeId, `scene:${scene.id}`, choice.id)
  const effects = choice.effects ?? {}
  if (effects.trust) await addTrust(themeId, effects.trust.personaId, effects.trust.delta)
  if (effects.reputation) {
    await awardReputation(effects.reputation.factionId, themeId, effects.reputation.delta)
  }
  let progress = null
  if (effects.xp) {
    progress = (await awardBonusXp(themeId, effects.xp)).progress
  }
  return { response: choice.response, progress }
}

/**
 * Picks a decision callout the given persona could deliver right now — a
 * line referencing a choice the player actually made. Null if this persona
 * holds no grudges (or gratitude) against this player yet.
 * @param {string} themeId
 * @param {Array<{id: string, choiceId: string}>} decisions
 * @param {string} personaId
 * @param {() => number} [random]
 * @returns {string | null}
 */
export function pickDecisionCallout(themeId, decisions, personaId, random = Math.random) {
  const eligible = DECISION_CALLOUTS.filter(
    (c) =>
      c.themeId === themeId &&
      c.personaId === personaId &&
      decisions.some((d) => d.id === c.decisionId && d.choiceId === c.choiceId)
  )
  if (eligible.length === 0) return null
  return eligible[Math.floor(random() * eligible.length)].line
}
