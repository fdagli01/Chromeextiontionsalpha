import { getAffinityRecordsForTheme } from '../db/affinityRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { awardReputation } from '../db/factionsRepo.js'
import { getWordsByTheme } from '../db/wordsRepo.js'
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
 * @property {string} [requiresTerm] - a word-gated choice: locked until the
 *   player has genuinely learned this term (reviewed at least once, not
 *   currently struggling). The fusion point between the RPG and the SRS —
 *   the best line in a scene is earned at the review desk, not the menu.
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
        {
          id: 'sekret',
          label: 'Name what the file really is: "This is not a секрет. It is a debt."',
          requiresTerm: 'секрет',
          response: '"A debt." He turns the word over like a coin he has been carrying too long. "Twenty years I filed these as secrets, because a secret is something you KEEP. A debt is something you OWE." He does not take the file back. But he writes two more names in it, in his own hand, before he goes — the ones he had never been able to file at all.',
          effects: { trust: { personaId: 'handler', delta: 3 }, reputation: { factionId: 'reformers', delta: 15 }, xp: 40 },
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
        {
          id: 'granitsa',
          label: 'Take the key — and tell him a cipher is a граница only he controls.',
          requiresTerm: 'граница',
          response: '"A border." He blinks, then laughs — a short, startled sound you have never heard from him. "Every border in this country was drawn by someone else. This one I drew." He eats the paper with something close to ceremony. Letters arrive for years afterwards, always in the cipher, always signed with a single red staple.',
          effects: { trust: { personaId: 'cipherClerk', delta: 3 }, reputation: { factionId: 'reformers', delta: 10 }, xp: 40 },
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
        {
          id: 'svoboda',
          label: 'Answer him in his own tongue: "Свобода is not a place."',
          requiresTerm: 'свобода',
          response: 'He stops with his hand on the door. "Свобода is not a place." He repeats it twice, the second time to himself. "Twenty years I ran from a country. You just told me what I was running toward." He leaves you the train ticket — the one from his own escape. "For whichever border you choose, clerk."',
          effects: { trust: { personaId: 'defector', delta: 3 }, reputation: { factionId: 'reformers', delta: 15 }, xp: 40 },
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
          id: 'glasnost',
          label: 'Give the margins their real name: "This is гласность."',
          requiresTerm: 'гласность',
          response: '"Гласность." He tests the word against the page, then against the room. "Not dissent. Not treason. OPENNESS — a word the Party itself prints." Something in him settles that four hundred readings never could. "Then I am not writing against the doctrine. I am writing the part it left out." He finishes the book. Your name is in the dedication, spelled correctly.',
          effects: { trust: { personaId: 'zealot', delta: 3 }, reputation: { factionId: 'reformers', delta: 15 }, xp: 40 },
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
        {
          id: 'loi',
          label: 'Tell him what he actually is: not a clerk of the Terror — a clerk of the tribunal.',
          requiresTerm: 'tribunal',
          response: '"The tribunal." He says it the way a man says his own name after a long illness. "Not the Terror\'s clerk. The TRIBUNAL\'s — an institution, which outlives whoever is currently shouting in it." He sits Wednesday. His indictment is the most grammatically flawless document of the year, and every historian who reads it understands exactly who was on trial.',
          effects: { trust: { personaId: 'tribunal', delta: 3 }, reputation: { factionId: 'girondins', delta: 15 }, xp: 40 },
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
          id: 'citoyen',
          label: 'Sign it as what he is: not a journalist, a citoyen.',
          requiresTerm: 'citoyen',
          response: '"A CITOYEN." He stops mid-flourish, genuinely struck. "Not a journalist correcting his trade — a citizen correcting the record of his own Republic. That is not an apology, that is a DUTY." He reprints the title page: ERRATA, BY A CITIZEN. It is the only thing he ever published without a joke in it.',
          effects: { trust: { personaId: 'pamphletaire', delta: 3 }, reputation: { factionId: 'girondins', delta: 15 }, xp: 40 },
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
        {
          id: 'citoyenne',
          label: 'Correct her once, gently: she is not a woman learning to read. She is a citoyen.',
          requiresTerm: 'citoyen',
          response: '"A citizen." She says it flatly, testing whether you are mocking her, and finds you are not. "Then the lessons are not a favour. They are a REPAIR." She learns like a street fight after that, and the first sentence she writes unaided is that word, four times, in a hand that gets steadier each time.',
          effects: { trust: { personaId: 'sansCulotte', delta: 3 }, reputation: { factionId: 'jacobins', delta: 10 }, xp: 40 },
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
        {
          id: 'liberte',
          label: 'Answer her motto with the Republic\'s word: "Liberté."',
          requiresTerm: 'liberté',
          response: 'Fourteen medieval words, answered with three modern syllables. She stares — then, unbelievably, she laughs. "One word against fourteen, and the one word wins. Very well, citizen. Put them BOTH in your archive. Let the centuries argue it out." Thursday, at the steps, she looks for you in the crowd and nods.',
          effects: { trust: { personaId: 'aristocrate', delta: 3 }, reputation: { factionId: 'jacobins', delta: 10 }, xp: 40 },
        },
      ],
    },
  ],
  italian: [
    {
      id: 'it-centurio-warm',
      themeId: 'italian',
      personaId: 'centurio',
      tier: 'warm',
      title: 'THE RECRUIT WHO CANNOT MARCH',
      body: 'Aulus finds you at drill, jaw set. "I have a recruit — best sword in the cohort, heart of a lion, and the boy cannot read the watchword board. He hides it well. I hid it too, at his age, until a centurion beat the letters into me. I am not that centurion. You are the archivist. Fix this quietly, or I lose my best blade to a chalkboard."',
      choices: [
        {
          id: 'teach',
          label: 'Teach the boy at night, off the duty roster.',
          response: '"Off the roster. Good. What the roster does not know, the roster cannot mock." Within a month the boy reads watchwords aloud for the whole watch — slightly too proudly. Aulus pretends not to notice either of you.',
          effects: { trust: { personaId: 'centurio', delta: 3 }, xp: 20 },
        },
        {
          id: 'report',
          label: 'Report it. Standards exist for a reason.',
          response: '"Standards." He says the word like a rock he has decided to carry. The boy is reassigned to the baggage train. Aulus never asks you for anything quiet again.',
          effects: { trust: { personaId: 'centurio', delta: -2 }, reputation: { factionId: 'stoics', delta: 10 } },
        },
      ],
    },
    {
      id: 'it-centurio-ally',
      themeId: 'italian',
      personaId: 'centurio',
      tier: 'ally',
      title: 'THE LETTER HOME',
      body: '"Twenty-six years in the legions. My discharge came through this morning." He sets a blank tablet in front of you. "There is a woman in Capua who has waited eleven of those years. Every winter I started this letter. Every spring I burned it. You are better with words than I am with anything. Help me say it — or tell me an old soldier is being a fool."',
      choices: [
        {
          id: 'write',
          label: 'Write it with him. Every word his, in better order.',
          response: 'It takes four hours and two false starts. The finished letter is nine lines. He reads it back twice, once silently, once aloud like an order of the day. "Nine lines. Twenty-six years. That is the correct ratio." He marches to Capua himself — faster than the post.',
          effects: { trust: { personaId: 'centurio', delta: 3 }, xp: 30 },
        },
        {
          id: 'aquila',
          label: 'Tell him: "You followed the aquila home. Follow it once more."',
          requiresTerm: 'aquila',
          response: 'The word lands like a standard being planted. "The aquila. Yes. A soldier does not write to the eagle — he REPORTS to it." He leaves that night with no letter at all, and sends you a single line from Capua in spring: "Reported. Accepted. Staying."',
          effects: { trust: { personaId: 'centurio', delta: 3 }, reputation: { factionId: 'stoics', delta: 10 }, xp: 40 },
        },
      ],
    },
    {
      id: 'it-senator-warm',
      themeId: 'italian',
      personaId: 'senator',
      tier: 'warm',
      title: 'THE MISPLACED MOTION',
      body: 'The Senator draws you behind a column, all silk and urgency. "Tomorrow the house votes on the grain tariff. My speech is magnificent. My arithmetic, however, was done by a nephew I employ for reasons of family peace. Check the numbers tonight. If they are wrong, I need never know they were wrong — I need only never say them."',
      choices: [
        {
          id: 'check',
          label: 'Check them. Correct the record before the vote.',
          response: 'The nephew was wrong by a factor of ten. The Senator delivers the corrected figures without blinking, wins the vote, and credits "diligent friends of Rome." A sestertius appears on your desk. Then, after a pause at the door, a second one.',
          effects: { trust: { personaId: 'senator', delta: 3 }, reputation: { factionId: 'populares', delta: 10 }, xp: 20 },
        },
        {
          id: 'decline',
          label: 'Decline. Senators should own their nephews\' errors.',
          response: '"Own them? I EMPLOY them — that is ownership enough." He delivers the wrong figures with total confidence, loses the vote, and blames the weather. The nephew is promoted, out of spite. Rome endures.',
          effects: { trust: { personaId: 'senator', delta: -1 }, reputation: { factionId: 'stoics', delta: 10 } },
        },
      ],
    },
    {
      id: 'it-senator-ally',
      themeId: 'italian',
      personaId: 'senator',
      tier: 'ally',
      title: 'THE EMPTY SEAT',
      body: 'For once he is not performing. "There is a seat opening on the archival commission. Real work, real records, real power over what Rome remembers. I can put your name on it tonight — one favor, freely given. Or I can put my nephew on it, and you remain my cleverest secret. Advise me, archivist. And be aware: I will remember the advice longer than the seat."',
      choices: [
        {
          id: 'accept',
          label: 'Take the seat. You will guard what Rome remembers.',
          response: '"Then it is done — and Rome\'s memory acquires a spine." He announces it as his own idea, naturally. But at the confirmation he votes first, loudly, before the house can hesitate: the only unpurchasable thing you ever saw him spend.',
          effects: { trust: { personaId: 'senator', delta: 2 }, reputation: { factionId: 'populares', delta: 15 }, xp: 35 },
        },
        {
          id: 'senato',
          label: 'Decline it: "The senato needs one honest man OUTSIDE it."',
          requiresTerm: 'senato',
          response: 'He blinks — genuinely caught, a rare vintage. "An honest man outside the senate, watching. That is not a refusal, archivist. That is a THREAT. I have never respected anything more." From that day he clears his speeches with you before the house hears them.',
          effects: { trust: { personaId: 'senator', delta: 3 }, reputation: { factionId: 'stoics', delta: 10 }, xp: 40 },
        },
      ],
    },
    {
      id: 'it-oracle-warm',
      themeId: 'italian',
      personaId: 'oracle',
      tier: 'warm',
      title: 'A PROPHECY, MISFILED',
      body: 'The Oracle drifts to your desk, trailing laurel and unease. "Twelve years ago I prophesied for a young officer: death by water. He resigned his commission, moved inland, became a magistrate. Yesterday I found my notes from that morning. The prophecy was for the NEXT petitioner. A scribe error — my scribe, my error. He is coming to thank me at the festival. What does one file under \'wrong destiny\'?"',
      choices: [
        {
          id: 'confess',
          label: 'She tells him the truth. Fate owes him twelve years.',
          response: 'The magistrate listens, then laughs until he weeps. "I HATED the sea!" He keeps the inland life, and sends the Oracle a jar of olives every festival, labeled: "For the error that made me." She files the notes under MERCIES, MISDIRECTED.',
          effects: { trust: { personaId: 'oracle', delta: 3 }, xp: 25 },
        },
        {
          id: 'silence',
          label: 'File it under silence. The life he built is real.',
          response: '"Silence. Yes. The gods speak carelessly; perhaps the filing should not." She accepts his thanks at the festival with perfect grace and afterward stands a long time at the harbor, watching the water that was never his.',
          effects: { trust: { personaId: 'oracle', delta: 2 }, reputation: { factionId: 'stoics', delta: 10 }, xp: 10 },
        },
      ],
    },
    {
      id: 'it-oracle-ally',
      themeId: 'italian',
      personaId: 'oracle',
      tier: 'ally',
      title: 'THE LAST LAUREL',
      body: '"The temple is closing. An edict — the new priests call my art superstition, which is rich, coming from men who read the future in bird livers. I have one prophecy left in me, archivist, and I am spending it on whom I choose." She takes your hand, professional and gentle. "Shall I tell you how your story ends? Be certain. Most people are wrong about wanting to know."',
      choices: [
        {
          id: 'hear',
          label: 'Hear it. An archivist should know the last page.',
          response: 'She studies your palm, then closes it into a fist without a word. "It ends in a library that does not exist yet, in a language that does. You build both." She will not explain. Oracles never explain. But she leaves you the laurel crown — "you will want proof, later, that this was real."',
          effects: { trust: { personaId: 'oracle', delta: 3 }, xp: 35 },
        },
        {
          id: 'refuse',
          label: 'Refuse. Spend it on herself — how does SHE end?',
          response: 'Silence. Then, softly: "Do you know, in forty years, no one has ever asked me that." She reads her own palm like a foreign text, and smiles at what she finds. "Ah. I end TEACHING. The edict closes the temple; it says nothing about a classroom." She opens one. You are enrolled without being consulted.',
          effects: { trust: { personaId: 'oracle', delta: 3 }, reputation: { factionId: 'stoics', delta: 15 }, xp: 25 },
        },
        {
          id: 'gloria',
          label: 'Refuse the prophecy — ask instead what she thinks gloria actually is.',
          requiresTerm: 'gloria',
          response: '"Gloria." She sets down your hand entirely. "Forty years of men asking me for it, and not one asked me what it WAS." She thinks for a long time. "It is being read after you are dead by someone who did not have to." She gives you the laurel anyway. "You will manage that. It is not a prophecy — it is an instruction."',
          effects: { trust: { personaId: 'oracle', delta: 3 }, reputation: { factionId: 'stoics', delta: 15 }, xp: 40 },
        },
      ],
    },
    {
      id: 'it-gladiator-warm',
      themeId: 'italian',
      personaId: 'gladiator',
      tier: 'warm',
      title: 'THE WOODEN SWORD',
      body: 'The Gladiator sits heavily by your desk, arena sand still on his boots. "They offered me the rudis today. The wooden sword. Freedom." He turns an imaginary blade in his hands. "Everyone I love is inside those walls. My trainer. My debts. My name — the crowd made my name, and the crowd stays when I go. Out there I am a big slow man who knows one trade. You are good with words: say the true thing, not the kind thing."',
      choices: [
        {
          id: 'take',
          label: 'Take the sword. A name owned by a crowd is a leash.',
          response: 'He is quiet a long time. "A leash. Yes. It was always a leash — it just cheered." He takes the rudis. The crowd riots, then forgets, exactly as crowds do. He opens a training school across the river and names it after no one.',
          effects: { trust: { personaId: 'gladiator', delta: 3 }, reputation: { factionId: 'populares', delta: 10 }, xp: 25 },
        },
        {
          id: 'stay',
          label: 'Stay one more season. Leave on a victory, not a mercy.',
          response: '"On a victory. On MY terms." His last season is his best; the poets overdo it beautifully. When he finally takes the rudis, the crowd stands in silence — which, he tells you later, is the only applause he ever kept.',
          effects: { trust: { personaId: 'gladiator', delta: 2 }, xp: 20 },
        },
      ],
    },
    {
      id: 'it-gladiator-ally',
      themeId: 'italian',
      personaId: 'gladiator',
      tier: 'ally',
      title: 'WHAT THE SAND KEEPS',
      body: '"I fought a man from my own village once. Neither of us knew until the helmets came off — after." He opens his hand: the pinch of arena sand he always carries. "His son came to the gates today. Not for revenge — for a TRADE. He wants to learn letters, says his father never could, says a man who cannot write dies twice. I have coin but no letters. You have letters. I am asking for the boy what I cannot ask for myself."',
      choices: [
        {
          id: 'both',
          label: 'Teach the boy — and the Gladiator, same bench, same hour.',
          response: 'He arrives at the first lesson "only to keep the boy honest," and stays. The two of them wrestle the alphabet like an opponent. The first sentence he ever writes unaided he shows you before anyone: the name of the man from his village, spelled correctly, kept.',
          effects: { trust: { personaId: 'gladiator', delta: 3 }, xp: 35 },
        },
        {
          id: 'boy',
          label: 'Teach the boy. Some debts pass down cleanly.',
          response: '"Cleanly. Yes." The boy learns fast and hungry, and writes his father\'s story in a copybook the Gladiator pays for but never reads. He does not need to. He funds three more copybooks for three more sons of three more names the sand keeps.',
          effects: { trust: { personaId: 'gladiator', delta: 2 }, reputation: { factionId: 'populares', delta: 15 }, xp: 20 },
        },
        {
          id: 'patria',
          label: 'Say the word the sand keeps: the man from his village died far from his patria.',
          requiresTerm: 'patria',
          response: 'He is quiet a long time. "Patria. Not Rome. The village." He opens his hand and looks at the sand as if seeing it for the first time. "Then I am not carrying an opponent. I am carrying a NEIGHBOUR." The school he opens takes the village\'s name, not his own, and the boy learns to write it first.',
          effects: { trust: { personaId: 'gladiator', delta: 3 }, reputation: { factionId: 'populares', delta: 15 }, xp: 40 },
        },
      ],
    },
  ],
  portuguese: [
    {
      id: 'pt-navigator-warm',
      themeId: 'portuguese',
      personaId: 'navigator',
      tier: 'warm',
      title: 'THE FALSE SOUNDING',
      body: 'Mestre Henrique spreads a chart, voice low. "The pilot\'s log from the Cabo run reports deep water in the southern channel. I sailed that channel as a boy — there is a shoal there that eats keels. Either the sea changed, or the pilot never sailed it and copied an older log. He is the Admiral\'s cousin, rapaz. Correcting his chart is calling him a liar with better handwriting."',
      choices: [
        {
          id: 'correct',
          label: 'Correct the chart. The sea does not care whose cousin drowns.',
          response: '"No," he agrees, "the sea is magnificently impartial." The correction goes in unsigned. Two seasons later a carrack takes the southern channel at night and lives. The pilot claims the correction as his own. Henrique lets him — "the shoal knows whose it is."',
          effects: { trust: { personaId: 'navigator', delta: 3 }, reputation: { factionId: 'crown-merchants', delta: -5 }, xp: 25 },
        },
        {
          id: 'defer',
          label: 'Log both soundings. Let the next captain choose.',
          response: '"Both truths on one chart. Diplomatic." He writes the annotation himself: TRUST THE OLDER FEAR. It becomes a saying among pilots who have never heard of either of you.',
          effects: { trust: { personaId: 'navigator', delta: 1 }, reputation: { factionId: 'crown-merchants', delta: 10 }, xp: 10 },
        },
      ],
    },
    {
      id: 'pt-navigator-ally',
      themeId: 'portuguese',
      personaId: 'navigator',
      tier: 'ally',
      title: 'THE LAST VOYAGE',
      body: '"The Crown offers me one more command. India run. My eyes are going, rapaz — I hide it with memory and shouting. A younger man should take her out. But charts are memory, and mine is the best afloat, and every man aboard would be safer with a half-blind Henrique than a clear-eyed fool." He looks at you the way he looks at weather. "You keep the records. What should the record advise?"',
      choices: [
        {
          id: 'sail',
          label: 'Sail. Put the best chart in the water, whatever its eyes.',
          response: '"Then I sail." He takes a second pilot — young, sharp-eyed, sworn to secrecy — and dictates the entire run from memory when the fog comes. The log of that voyage reads like scripture. His last entry: "Eyes failing. Memory holding. Recommend the boy."',
          effects: { trust: { personaId: 'navigator', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 35 },
        },
        {
          id: 'saudade',
          label: 'Say the word for what he actually feels: "Saudade, Mestre."',
          requiresTerm: 'saudade',
          response: 'The word stops him like a reef. "Saudade. For a sea I can still sail." He is quiet, then laughs at himself, an old rope creaking. "You diagnosed me in one word, rapaz. I will go — but as TEACHER, not commander. Let the longing train the next hundred eyes." The navigation school takes his name while he is still alive to be embarrassed by it.',
          effects: { trust: { personaId: 'navigator', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 40 },
        },
      ],
    },
    {
      id: 'pt-cartographer-warm',
      themeId: 'portuguese',
      personaId: 'cartographer',
      tier: 'warm',
      title: 'THE COASTLINE THAT ISN\'T',
      body: 'The Cartographer unrolls a rival\'s map with tweezers, as if it might infect hers. "This Genoese chart shows an island at forty leagues west-southwest. There is no island. I have THREE logs proving open water. But the Crown buyer loves the island — an island is a CLAIM, and claims are money. She wants me to copy it onto the official chart. I draw coastlines that exist. It is my entire personality. Advise me before I say something unemployable."',
      choices: [
        {
          id: 'truth',
          label: 'Open water. A false island will drown a real crew.',
          response: '"THANK you." She draws the open water, annotates the rival\'s island as REPORTED, NOT CONFIRMED, in letters small enough to be legal and large enough to be insulting. The buyer sulks. Three years later a fleet provisions for the island and finds her open water — and her annotation. Her price doubles.',
          effects: { trust: { personaId: 'cartographer', delta: 3 }, reputation: { factionId: 'crown-merchants', delta: -5 }, xp: 25 },
        },
        {
          id: 'island',
          label: 'Draw the island. Let the ocean correct the record.',
          response: 'She draws it — technically perfectly, under protest, with a cartouche that reads AS INSTRUCTED. The ocean, in time, corrects the record at the cost of a caravel\'s rudder. The cartouche is quietly scraped off. Hers was the only signature that survived the scandal clean.',
          effects: { trust: { personaId: 'cartographer', delta: -1 }, reputation: { factionId: 'crown-merchants', delta: 15 } },
        },
      ],
    },
    {
      id: 'pt-cartographer-ally',
      themeId: 'portuguese',
      personaId: 'cartographer',
      tier: 'ally',
      title: 'THE UNFINISHED EDGE',
      body: 'She shows you her life\'s work: the master chart, and its vast blank east. "Every mapmaker fills the unknown with monsters or with God. I have left it EMPTY for thirty years, and the emptiness is the most honest thing I ever drew. Now the guild wants it \'completed for presentation.\' Sea serpents, they suggest. PUTTI." She hands you the pen, which she has never done. "You write in archives. What belongs at the edge of what we know?"',
      choices: [
        {
          id: 'roteiro',
          label: 'Write the sailor\'s word for the way onward: "Roteiro."',
          requiresTerm: 'roteiro',
          response: 'One word at the blank edge: ROTEIRO — the route log, the promise that someone will go and write it down. She stares at it a long moment. "Not a monster. Not a god. An INSTRUCTION." The guild hates it. Every pilot who sees it asks for a copy. It becomes the most reproduced chart of the age, blank east and all.',
          effects: { trust: { personaId: 'cartographer', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 40 },
        },
        {
          id: 'empty',
          label: 'Nothing. The blank IS the map\'s best sentence.',
          response: '"Nothing." She sets the pen down like a verdict. "The blank stays. Let the guild present THAT." They do, grudgingly — and the room falls silent at the honest emptiness in a way no sea serpent ever managed. She wills you the chart, on the condition you never finish it.',
          effects: { trust: { personaId: 'cartographer', delta: 3 }, xp: 30 },
        },
      ],
    },
    {
      id: 'pt-priest-warm',
      themeId: 'portuguese',
      personaId: 'priest',
      tier: 'warm',
      title: 'TWO DICTIONARIES',
      body: 'The Priest comes aboard at Goa with a chest and a moral injury. "Ten years I compiled a dictionary of the coastal tongue — for the mission, to preach in their words. Yesterday the factor asked for a copy. For CONTRACTS, rapaz. My dictionary, drafted to carry the Gospel, will carry indenture clauses. I can burn ten years of work, or arm it. The rosary is no help; it only counts."',
      choices: [
        {
          id: 'share',
          label: 'Share it — words cannot be kept from commerce, only balanced.',
          response: '"Balanced." He copies it for the factor — and adds an appendix: the coastal words for CHEAT, WITNESS, and APPEAL, cross-referenced to Portuguese law. "If my dictionary writes their contracts, it will also read them." The factor never notices. The coastal traders do.',
          effects: { trust: { personaId: 'priest', delta: 3 }, reputation: { factionId: 'crown-merchants', delta: 5 }, xp: 25 },
        },
        {
          id: 'withhold',
          label: 'Withhold it. Some tools should not change hands.',
          response: '"Withheld, then. The mission owns a locked chest and I own the key and God owns the awkwardness." The factor hires a lapsed seminarian at triple wage to rebuild it badly. The bad dictionary voids two contracts in court. The Priest calls this "providence, working through poor spelling."',
          effects: { trust: { personaId: 'priest', delta: 2 }, reputation: { factionId: 'crown-merchants', delta: -10 }, xp: 15 },
        },
      ],
    },
    {
      id: 'pt-priest-ally',
      themeId: 'portuguese',
      personaId: 'priest',
      tier: 'ally',
      title: 'THE MISSING BEAD',
      body: 'He finds you at the rail at dusk and holds out the rosary with its one absent bead. "You know why it is missing? A boy in the fever ward asked what I held, and I told him each bead was a prayer. He asked to KEEP one. I broke the string before I finished thinking." He watches the wake. "He recovered. Sails now, on the Malacca run. I am old, rapaz, and the string will break for good someday. I am deciding where the rest of the beads should go."',
      choices: [
        {
          id: 'scatter',
          label: 'Give them away, one by one, to whoever asks what he holds.',
          response: '"One by one. Until the string is only string." He beams — decision made, burden gone. Over two years the rosary thins across every port from Lisbon to Goa. The last bead he presses into your palm at the gangway. "Prayer number one. It was always going to be you."',
          effects: { trust: { personaId: 'priest', delta: 3 }, xp: 35 },
        },
        {
          id: 'keep',
          label: 'Keep the string whole. Incompleteness is its sermon.',
          response: '"A rosary one prayer short — teaching me arithmetic every evening: what is counted, what is missing, what was given away." He nods slowly. "It stays whole. Broken exactly once, on purpose, for a reason. Like most of us." He wills it to the fever ward, string and all.',
          effects: { trust: { personaId: 'priest', delta: 2 }, reputation: { factionId: 'navigators', delta: 10 }, xp: 25 },
        },
        {
          id: 'viagem',
          label: 'Tell him the rosary was never a count. It was a viagem.',
          requiresTerm: 'viagem',
          response: '"A voyage." He holds the broken string up against the last of the light. "Of course. You do not count a voyage — you make it, and you arrive short of what you set out with." He gives the beads away one by one from that evening on, and calls each one a port. The last he presses into your palm at the gangway: "First prayer. It was always going to be you."',
          effects: { trust: { personaId: 'priest', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 40 },
        },
      ],
    },
    {
      id: 'pt-stowaway-warm',
      themeId: 'portuguese',
      personaId: 'stowaway',
      tier: 'warm',
      title: 'MANIFEST ERROR',
      body: 'The Stowaway materializes beside your desk, which is her only way of arriving anywhere. "Small problem. The purser is recounting the manifest tomorrow, and the manifest says forty-one souls, and there are forty-two, and I am the two." She produces, from nowhere, an orange, and offers you half. "You keep records. Records can keep me. One line, rapaz: a name on the muster. Any name. I have always wanted to be officially anybody."',
      choices: [
        {
          id: 'muster',
          label: 'Write her in: ship\'s girl, ordinary wages, real name.',
          response: '"REAL name?" She has to think about what it is — it takes a moment, and the moment is the whole story of her. The line goes in the muster. At first wages she stares at the coins like foreign coastline. "Officially somebody," she reports, "pays better than expected."',
          effects: { trust: { personaId: 'stowaway', delta: 3 }, reputation: { factionId: 'crown-merchants', delta: -5 }, xp: 25 },
        },
        {
          id: 'hide',
          label: 'No forgery. But the recount can be... rescheduled.',
          response: 'The purser\'s ink freezes solid in a warm cabin — remarkable weather. The recount slips a week; the ship makes port; the count becomes moot. She repays you in intelligence: which cook waters the wine, which mate reads your letters. The orange, it turns out, was the purser\'s.',
          effects: { trust: { personaId: 'stowaway', delta: 2 }, xp: 15 },
        },
      ],
    },
    {
      id: 'pt-stowaway-ally',
      themeId: 'portuguese',
      personaId: 'stowaway',
      tier: 'ally',
      title: 'THE MERMAID\'S CHART',
      body: 'She unfolds the thing she "found" long ago: a chart margin with a bored sailor\'s mermaid drawn on it — and, you notice, coastline beneath the doodle. Real coastline. Uncharted coastline. "I have carried her for six years for the mermaid. You are looking at the LAND, aren\'t you. That is why I showed you." She watches your face carefully. "If that shore is real, it is worth a fortune. And someone drew it and died unnamed on some manifest. So: fortune, or footnote?"',
      choices: [
        {
          id: 'footnote',
          label: 'Chart it — credited to "hand unknown, kept by a friend."',
          response: 'The coastline checks out against three logs. It enters the master chart with the strangest attribution in the archive: HAND UNKNOWN, KEPT BY A FRIEND. She visits the chart sometimes, the way other people visit graves. "He is officially somebody now too," she says. She leaves the mermaid half with you.',
          effects: { trust: { personaId: 'stowaway', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 40 },
        },
        {
          id: 'fortune',
          label: 'Sell the bearing to the Crown. Split it — she eats for a decade.',
          response: 'The Crown pays richly and asks no questions, which is the Crown\'s one reliable virtue. She holds actual wealth for the first time and finds it "heavier than rope." Half of it vanishes into every galley boy and dock orphan from here to Madeira. The mermaid she keeps. "Not for sale. She is FAMILY."',
          effects: { trust: { personaId: 'stowaway', delta: 2 }, reputation: { factionId: 'crown-merchants', delta: 15 }, xp: 25 },
        },
        {
          id: 'descobrimento',
          label: 'Name it properly: an unnamed hand made a descobrimento.',
          requiresTerm: 'descobrimento',
          response: '"A DISCOVERY." She says it like a verdict being overturned. "Not a doodle. Not a scrap I stole. A discovery, by a man whose name nobody wrote down." The coastline enters the master chart under the strangest attribution in the archive, and she visits it the way other people visit graves. She leaves you the mermaid half.',
          effects: { trust: { personaId: 'stowaway', delta: 3 }, reputation: { factionId: 'navigators', delta: 15 }, xp: 40 },
        },
      ],
    },
  ],
  spanish: [
    {
      id: 'es-censor-warm',
      themeId: 'spanish',
      personaId: 'censor',
      tier: 'warm',
      title: 'STRIKE-THROUGH',
      body: 'The Censor closes the office door — which he never does — and lays a poem on your desk. His red pencil hovers, for once, undecided. "Orders: nothing that weakens morale. This is a poem about a dead soldier\'s boots. It is the truest thing I have read this war. It will make ten thousand mothers weep, and I cannot decide if that weakens morale or IS morale. My pencil has never hesitated before. I find I do not like it."',
      choices: [
        {
          id: 'pass',
          label: 'Pass it uncut. Grief is not defeatism.',
          response: 'The poem runs. It is read aloud in trenches, copied by hand, carried in breast pockets. Morale does not break; it deepens. The Censor files one carbon copy in a folder he labels, in red pencil, EXCEPTIONS — the folder\'s first and, for a long time, only occupant.',
          effects: { trust: { personaId: 'censor', delta: 3 }, reputation: { factionId: 'republicanos', delta: 10 }, xp: 25 },
        },
        {
          id: 'cut',
          label: 'Cut the last stanza. Save the poem by trimming its despair.',
          response: 'He cuts it — cleanly, respectfully, the way a surgeon would. The shortened poem still runs, still moves, and ends one breath before the abyss. Years later an anthology prints it "restored." Readers argue forever over which version is truer. The Censor owns both and will not say.',
          effects: { trust: { personaId: 'censor', delta: 2 }, reputation: { factionId: 'republicanos', delta: 5 }, xp: 15 },
        },
      ],
    },
    {
      id: 'es-censor-ally',
      themeId: 'spanish',
      personaId: 'censor',
      tier: 'ally',
      title: 'THE SELF-CENSORED MAN',
      body: '"I have censored four hundred writers. Tonight I discover I have been censoring a four hundred and first." He opens a drawer: a manuscript, his own, years of it — and every tenth line struck through in his own red pencil. "I cut myself before anyone else can. It is the occupational disease. The war will end someday, rapaz, one way or the other. Tell me what a censor does with a book he was too frightened to finish writing."',
      choices: [
        {
          id: 'censura',
          label: 'Hand him his pencil: "You know censura from both sides now. Write THAT."',
          requiresTerm: 'censura',
          response: 'He looks at the pencil, then at you, then writes the title across the manuscript\'s first page: CENSURA — A CONFESSION. "From both sides. Yes. The only book on the subject that could ever be complete." He writes nightly now, and strikes nothing. The red pencil sits retired in a drinking glass, like a cut flower.',
          effects: { trust: { personaId: 'censor', delta: 3 }, reputation: { factionId: 'exiliados', delta: 10 }, xp: 40 },
        },
        {
          id: 'restore',
          label: 'Restore the struck lines together. Every tenth line, back.',
          response: 'It takes six evenings. Under the red strikes the missing lines are all the same species: doubt, tenderness, fear — everything a censor is paid to catch. Restored, the manuscript stops being careful and starts being true. "So THAT is what I kept confiscating," he says quietly. "I owe four hundred apologies."',
          effects: { trust: { personaId: 'censor', delta: 3 }, xp: 35 },
        },
      ],
    },
    {
      id: 'es-corresponsal-warm',
      themeId: 'spanish',
      personaId: 'corresponsal',
      tier: 'warm',
      title: 'THE ROLL SHE CANNOT DEVELOP',
      body: 'The Correspondent finds you after curfew, camera still around her neck like a verdict. "Frame twelve. The bridge at dawn. If I develop this roll, frame twelve identifies three men to whoever seizes my darkroom — and darkrooms get seized weekly. If I do not develop it, the world never sees frames one through eleven, and eleven is the best work of my life." She sets the roll on your desk. "You keep archives. Keep a dilemma."',
      choices: [
        {
          id: 'develop',
          label: 'Develop it here, tonight. Cut frame twelve from the negative.',
          response: 'You rig a darkroom from archive supplies and blackout cloth. Eleven frames go to the wire services; frame twelve, cut free, burns in a censor-approved ashtray. Eleven runs on front pages in four countries. The three men on the bridge never know they were almost famous. She works your "archive darkroom" all war.',
          effects: { trust: { personaId: 'corresponsal', delta: 3 }, reputation: { factionId: 'republicanos', delta: 10 }, xp: 30 },
        },
        {
          id: 'hold',
          label: 'Archive the roll undeveloped. Some pictures must wait for peace.',
          response: 'The roll goes into the deepest drawer, labeled in a hand only two people can read: DAWN, BRIDGE, WAIT. She hates it and agrees with it in the same breath. "If I don\'t come back," she says — the old instruction — "develop it when it can\'t hurt anyone. That is a strange definition of never."',
          effects: { trust: { personaId: 'corresponsal', delta: 2 }, reputation: { factionId: 'exiliados', delta: 10 }, xp: 20 },
        },
      ],
    },
    {
      id: 'es-corresponsal-ally',
      themeId: 'spanish',
      personaId: 'corresponsal',
      tier: 'ally',
      title: 'THE LAST WIRE OUT',
      body: '"The border closes Friday. My editor cables: COME HOME, STORY OVER. My eyes cable back: the story is not over, it is only losing." She is packing and unpacking the same camera bag as she talks. "Every reporter left is a reporter the world still hears. Every reporter left is also a hostage the moment the wire cuts. I have never once known when a story ends, rapaz. That is your trade — archives END things. End this one for me, or refuse to."',
      choices: [
        {
          id: 'stay',
          label: 'The story ends when the wire cuts — not before. Stay.',
          response: 'She stays past the border closing, files by courier, by fishing boat, once by carrier pigeon she swears was "mostly reliable." The dispatches from those months are the ones the histories quote. She is the last byline out — and the first one back, years later, camera first through the reopened border.',
          effects: { trust: { personaId: 'corresponsal', delta: 3 }, reputation: { factionId: 'republicanos', delta: 15 }, xp: 40 },
        },
        {
          id: 'go',
          label: 'Go Friday. A dead witness testifies to nothing.',
          response: '"A dead witness testifies to nothing." She writes it on her wrist like a shot number, and crosses Friday with the last convoy, filing from the far side of the mountains until the war ends. The undeveloped rolls in her bag — twenty-two of them — become the exhibition that makes the world finally look. Witness, surviving.',
          effects: { trust: { personaId: 'corresponsal', delta: 2 }, reputation: { factionId: 'exiliados', delta: 15 }, xp: 30 },
        },
        {
          id: 'resistencia',
          label: 'Give her the word for staying: this is not stubbornness, it is resistencia.',
          requiresTerm: 'resistencia',
          response: '"Resistencia." She stops packing. "Not a reporter refusing to leave. A witness REMAINING." She stays past the border closing and files by courier, by fishing boat, once by a pigeon she swears was mostly reliable. Those months are the dispatches the histories quote — and the word is in the first line of every one of them.',
          effects: { trust: { personaId: 'corresponsal', delta: 3 }, reputation: { factionId: 'republicanos', delta: 15 }, xp: 40 },
        },
      ],
    },
    {
      id: 'es-miliciana-warm',
      themeId: 'spanish',
      personaId: 'miliciana',
      tier: 'warm',
      title: 'THE SHELL CASING',
      body: 'La Miliciana polishes the brass casing she carries — you have never asked; tonight she tells you anyway. "First day at the front. First shot I ever fired. I keep it bright so I remember the girl who fired it — she thought war was a poster." She sets it upright on your desk like a tiny monument. "My sister writes from Valencia: COME HOME, ONE HERO PER FAMILY IS ENOUGH. She is seventeen. She is also not wrong. Cuartel says you are honest with words. Be honest now."',
      choices: [
        {
          id: 'front',
          label: 'The line needs the woman the poster-girl became. Hold.',
          response: '"Hold." She takes the casing back and pockets it — monument dismissed, soldier resumed. She writes her sister the truth instead of comfort: war is not a poster, and that is exactly why someone who knows it must stand in it. The sister frames the letter. Seventeen-year-olds are complicated.',
          effects: { trust: { personaId: 'miliciana', delta: 3 }, reputation: { factionId: 'republicanos', delta: 10 }, xp: 25 },
        },
        {
          id: 'home',
          label: 'Heroes are also sisters. Take the Valencia leave.',
          response: 'She fights it, then files the leave. A week in Valencia: she teaches her sister to strip a rifle "for after the war, for rabbits," and comes back with clear eyes and a jar of her mother\'s olives for the trench. "One hero per family," she reports, "is a NEGOTIATION." The casing now lives in Valencia, on a windowsill.',
          effects: { trust: { personaId: 'miliciana', delta: 2 }, reputation: { factionId: 'exiliados', delta: 5 }, xp: 20 },
        },
      ],
    },
    {
      id: 'es-miliciana-ally',
      themeId: 'spanish',
      personaId: 'miliciana',
      tier: 'ally',
      title: 'WHAT THE WALL SAYS',
      body: 'She brings you paint in an ammunition tin. "The wall at the crossroads. Every unit that holds this sector writes on it — names, slogans, jokes about the cooking. Ours rotates out tomorrow and the wall is full and I have one brick left." The brush is already in her hand, held out to you. "You are the one who knows words, compañero. One brick. Choose what a wall remembers. And be aware I will read it every time I pass for the rest of my life."',
      choices: [
        {
          id: 'nopasaran',
          label: 'Write the words the whole line lives by: "No pasarán."',
          requiresTerm: 'no pasarán',
          response: 'Three syllables on one brick, steady letters. She reads it and stands very straight. "The whole wall was already saying it. Now it is SIGNED." Years later, plaster covers the wall — except, by some mason\'s quiet decision, one brick. It is the one photograph of the war she keeps framed.',
          effects: { trust: { personaId: 'miliciana', delta: 3 }, reputation: { factionId: 'republicanos', delta: 15 }, xp: 40 },
        },
        {
          id: 'names',
          label: 'No slogan. Write the names of her unit, all of them, small.',
          response: 'Fourteen names in letters small enough to fit one brick, hers last. She traces each one with a fingertip like a roll call. "Slogans hold walls," she says finally. "Names hold PEOPLE." From then on every unit that rotates through copies the idea, brick after brick, until the wall is a muster of everyone who stood there.',
          effects: { trust: { personaId: 'miliciana', delta: 3 }, xp: 35 },
        },
      ],
    },
    {
      id: 'es-abuelo-warm',
      themeId: 'spanish',
      personaId: 'abuelo',
      tier: 'warm',
      title: 'THE OTHER SCARF',
      body: 'El Abuelo sits by your desk with two wool scarves: the one he lends everyone, and one you have never seen, older, mended, wrong colors. "My brother\'s. We chose different sides in \'34, and then the war chose harder. He is across the lines now — alive, I hear, still wrong, still my brother." He smooths the old scarf flat. "There is a prisoner exchange Thursday. I can send a package through the Red Cross. A scarf is not politics, rapaz. Or it is ALL politics. I no longer know. You decide; my hands are cold either way."',
      choices: [
        {
          id: 'send',
          label: 'Send it. Wool crosses lines that words cannot.',
          response: 'The package goes through — no letter, just wool and one line: THE FRONT IS COLD ON BOTH SIDES. Months later a package returns: tobacco, his brother\'s brand from before the war, no letter either. They never write. They keep sending. It is not peace, he says, "but it is WEATHER we agree on."',
          effects: { trust: { personaId: 'abuelo', delta: 3 }, reputation: { factionId: 'republicanos', delta: -5 }, xp: 30 },
        },
        {
          id: 'keep',
          label: 'Keep it here. Some doors should stay closed until the war ends.',
          response: 'He folds the scarf into your archive drawer — "neutral territory," he decides, "like Switzerland, but with better filing." Every week he checks that it is still there, which is not really checking on the scarf. When the war ends he takes it back and boards the first bus north, wearing both.',
          effects: { trust: { personaId: 'abuelo', delta: 2 }, reputation: { factionId: 'republicanos', delta: 10 }, xp: 15 },
        },
      ],
    },
    {
      id: 'es-abuelo-ally',
      themeId: 'spanish',
      personaId: 'abuelo',
      tier: 'ally',
      title: 'THE LIST IN HIS HEAD',
      body: '"I am the oldest man in this sector, which means I am its memory. Forty-one dead I can name — full names, villages, one joke each. The young ones say \'after the war we will write it all down.\' Rapaz, I have BEEN after a war. Nothing is written down after; after is for forgetting as fast as possible." He taps his temple. "It is all here, and here has shrapnel in it. Sit with me and write, or promise me the young ones are right."',
      choices: [
        {
          id: 'exilio',
          label: 'Write it now — and title it with the word he fears: "Exilio."',
          requiresTerm: 'exilio',
          response: '"Exilio. Yes. Because that is where lists like this end up — carried out in coat linings." Three evenings, forty-one names, forty-one villages, forty-one jokes, some of them even funny. He signs it as WITNESS, you as CLERK. When the border closes, the list crosses in a coat lining, exactly as he said, and is read aloud in a Toulouse kitchen every year on the same night.',
          effects: { trust: { personaId: 'abuelo', delta: 3 }, reputation: { factionId: 'exiliados', delta: 15 }, xp: 40 },
        },
        {
          id: 'write',
          label: 'Write it now, plain and unsigned. Memory first, titles later.',
          response: 'Three evenings, forty-one entries, no title, no signatures — "harder to confiscate what refuses to announce itself." He quizzes you afterward like a drill sergeant: name, village, joke. You miss one joke. He makes you write it twice. "NOW you are the memory too," he says, satisfied. "Try to get shot less than I did."',
          effects: { trust: { personaId: 'abuelo', delta: 3 }, xp: 35 },
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
  { themeId: 'italian', decisionId: 'scene:it-centurio-warm', choiceId: 'report', personaId: 'centurio', line: 'The baggage train boy made corporal — of the baggage train. Standards, archivist. We both remember standards.' },
  { themeId: 'italian', decisionId: 'scene:it-centurio-warm', choiceId: 'teach', personaId: 'centurio', line: 'The boy reads dispatches for the tribune now. Reads them TOO well. This is your fault and I have decided to allow it.' },
  { themeId: 'italian', decisionId: 'scene:it-senator-ally', choiceId: 'senato', personaId: 'senator', line: 'My speech tomorrow — you will want to review it. The honest man outside the senate insists, I am told.' },
  { themeId: 'portuguese', decisionId: 'scene:pt-navigator-warm', choiceId: 'correct', personaId: 'navigator', line: 'Another carrack cleared the southern channel this week, rapaz. The shoal still knows whose correction that was.' },
  { themeId: 'portuguese', decisionId: 'scene:pt-stowaway-warm', choiceId: 'muster', personaId: 'stowaway', line: 'Officially somebody, three voyages running. The purser says my name now without checking the muster. MY name.' },
  { themeId: 'spanish', decisionId: 'scene:es-censor-warm', choiceId: 'pass', personaId: 'censor', line: 'The EXCEPTIONS folder has four occupants now. The first one is still your fault, compañero.' },
  { themeId: 'spanish', decisionId: 'scene:es-miliciana-ally', choiceId: 'nopasaran', personaId: 'miliciana', line: 'I passed the crossroads wall yesterday. The brick holds, compañero. The signature holds.' },
  { themeId: 'spanish', decisionId: 'contraband-sale', choiceId: 'sold', personaId: 'censor', line: 'Words moving through back channels again. I censor pages, compañero, not people — but I NOTICE.' },
]

/**
 * Whether the player has genuinely learned a term in this theme: it is in
 * their archive, has survived at least one review, and is not currently
 * struggling. This is what a word-gated scene choice checks — knowledge
 * earned at the desk, verified by the scheduler, spent in the story.
 * @param {string} themeId
 * @param {string} term
 * @returns {Promise<boolean>}
 */
export async function isTermKnown(themeId, term) {
  const words = await getWordsByTheme(themeId)
  const needle = term.trim().toLowerCase()
  const word = words.find((w) => w.term.trim().toLowerCase() === needle)
  return !!word && word.lastReviewedAt != null && !word.struggling
}

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
