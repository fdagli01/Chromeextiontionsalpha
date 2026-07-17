import { addWord, getWordsByTheme } from '../db/wordsRepo.js'
import { getTransliteration } from '../transliteration/index.js'

/**
 * The one-time Ally reward: three words in a persona's own jargon, auto-
 * filed into the archive the moment their trust first crosses into Ally
 * (see progression/affinity.js). Keyed "themeId:personaId". Deliberately
 * lighter than a full curated entry (term/translation/fact only, no
 * example/philosophy) — this is a loyalty bonus, not the primary content
 * pipeline.
 * @type {Record<string, {term: string, translation: string, fact: string}[]>}
 */
export const ALLY_PACKS = {
  'russian:handler': [
    { term: 'конспирация', translation: 'tradecraft secrecy', fact: 'The discipline of not being observed, not being followed, and not being connected to anyone else in the network — the Bureau\'s entire culture in one word.' },
    { term: 'явка', translation: 'safehouse', fact: 'A pre-arranged meeting point known only to a handler and their agent, often an ordinary apartment or shop with no visible connection to either.' },
    { term: 'связной', translation: 'courier/liaison', fact: 'The go-between who physically carried messages or film between an agent and their handler, precisely so the two never had to meet directly.' },
  ],
  'russian:cipherClerk': [
    { term: 'шифровка', translation: 'cipher message', fact: 'An encoded transmission — before computers, this meant hours of manual substitution against a one-time pad, checked twice for a single wrong digit.' },
    { term: 'депеша', translation: 'dispatch', fact: 'An official urgent message, the word borrowed from French — Russian bureaucratic vocabulary absorbed a great deal of French terminology in the 18th and 19th centuries.' },
    { term: 'картотека', translation: 'card index', fact: 'The physical filing system — drawers of index cards — that Soviet records offices relied on for decades after most Western institutions had computerized theirs.' },
  ],
  'russian:defector': [
    { term: 'невозвращенец', translation: 'defector (lit. "non-returner")', fact: 'The precise Soviet legal term for a citizen who simply never came home from an authorized trip abroad — a whole bureaucratic category built around leaving quietly.' },
    { term: 'убежище', translation: 'asylum/refuge', fact: 'What a defector formally requested on arrival in a Western country — the same word used for a bomb shelter, "a place that shelters".' },
    { term: 'эмиграция', translation: 'emigration', fact: 'Distinguished carefully in Soviet law from невозвращенец — one was a legal (if discouraged) process, the other a crime.' },
  ],
  'russian:zealot': [
    { term: 'идеология', translation: 'ideology', fact: 'Treated in the USSR not as one worldview among others but as a settled science — "scientific socialism" — which is why deviating from it was framed as an error of fact, not opinion.' },
    { term: 'донос', translation: 'denunciation', fact: 'A formal written report on a colleague or neighbor\'s suspicious behavior — a genre of writing with its own unwritten conventions during the purges of the 1930s.' },
    { term: 'присяга', translation: 'oath/pledge', fact: 'The military and Party oath sworn on joining — breaking it was treated as a far graver offense than breaking an ordinary promise.' },
  ],
  'italian:centurio': [
    { term: 'vessillo', translation: 'standard/banner', fact: 'Distinct from the legion\'s aquila — a vessillum marked a detachment or a veteran unit (vexillarii) operating apart from the main legion.' },
    { term: 'disciplina', translation: 'discipline', fact: 'Roman military discipline was severe enough to have its own punishment for a unit\'s collective failure: decimation, the execution of one in ten men, chosen by lot.' },
    { term: 'accampamento', translation: 'camp', fact: 'A Roman legion built a fully fortified marching camp — ditch, rampart, gates — every single night on campaign, even for one night\'s stay.' },
  ],
  'italian:senator': [
    { term: 'clientela', translation: 'clientele (political patronage network)', fact: 'A patrician\'s clientela — commoners bound to him by mutual obligation — was a real political power base, inherited across generations like property.' },
    { term: 'seggio', translation: 'seat (in the Senate)', fact: 'Seating in the Senate broadly followed rank and seniority — where you sat signaled, wordlessly, how much the chamber was expected to weigh your voice.' },
    { term: 'immunità', translation: 'immunity', fact: 'Certain magistrates held immunity from prosecution while in office — a protection Cicero himself argued fiercely about, on both sides, depending on who was accused.' },
  ],
  'italian:oracle': [
    { term: 'presagio', translation: 'omen', fact: 'Roman state religion took omens seriously enough that an unfavorable one could legally postpone a vote, a battle, or an election.' },
    { term: 'vaticinio', translation: 'prophecy', fact: 'The root of the English "vaticination" — and, unrelatedly but memorably, of "Vatican", both tracing back to a hill associated with prophetic utterance.' },
    { term: 'incenso', translation: 'incense', fact: 'Burned at both public sacrifices and private household shrines alike — one of the few religious materials common to nearly every rank of Roman society.' },
  ],
  'italian:gladiator': [
    { term: 'arena', translation: 'arena', fact: 'Literally "sand" in Latin — the sand covering the amphitheater floor, there specifically to absorb blood, gave the whole space its name.' },
    { term: 'gladio', translation: 'short sword (gladius)', fact: 'The gladius was a short stabbing sword, not the long slashing blade Hollywood usually shows — brutally efficient in the tight formation of a legion line.' },
    { term: 'sangue', translation: 'blood', fact: 'Gladiatorial games were technically funeral rites (munera) long before they became mass public entertainment — blood spilled in honor of the dead.' },
  ],
  'portuguese:navigator': [
    { term: 'proa', translation: 'bow (of a ship)', fact: 'The lookout position at the proa was where a ship\'s most experienced sailor watched for reefs, shoals, and unfamiliar coastlines on uncharted routes.' },
    { term: 'popa', translation: 'stern', fact: 'The captain\'s quarters and the ship\'s compass were both kept at the popa — the most stable part of the vessel in heavy seas.' },
    { term: 'singradura', translation: "a day's run (nautical distance)", fact: "A ship's singradura — noon-to-noon distance — was the basic unit pilots used to estimate position before reliable longitude calculation existed." },
  ],
  'portuguese:cartographer': [
    { term: 'pergaminho', translation: 'parchment', fact: 'The finest Portuguese nautical charts were drawn on parchment rather than paper specifically because it survived a sea voyage\'s damp far better.' },
    { term: 'latitude', translation: 'latitude', fact: 'Latitude could be measured accurately at sea by the 1400s using the sun\'s height; longitude remained a guessing game for pilots for another three centuries.' },
    { term: 'meridiano', translation: 'meridian', fact: "The Treaty of Tordesillas (1494) drew a single meridian line across the Atlantic to divide the entire unexplored world between Portugal and Spain." },
  ],
  'portuguese:stowaway': [
    { term: 'porão', translation: "ship's hold", fact: 'The porão was where cargo, ballast, and — occasionally — undeclared passengers rode out a voyage in cramped darkness below the waterline.' },
    { term: 'contrabando', translation: 'contraband', fact: "The crown's trade monopolies made smuggling spices and gold a genuinely lucrative crime — entire small fortunes were built on goods that never appeared on a manifest." },
    { term: 'fuga', translation: 'escape/flight', fact: 'Desertion mid-voyage was punished severely, but arriving in a distant port sometimes offered a sailor his only real chance to simply disappear into a new life.' },
  ],
  'portuguese:priest': [
    { term: 'bênção', translation: 'blessing', fact: "A departing crew's blessing at the dockside chapel was often the last formal ceremony before a voyage that, for many ships, had real odds of not returning." },
    { term: 'missa', translation: 'mass', fact: 'Shipboard chaplains held mass at sea on a fixed schedule where possible — one of the few threads of ordinary routine on a voyage that could last over a year.' },
    { term: 'rosário', translation: 'rosary', fact: 'A sailor\'s rosary, often carved from ship\'s wood or bone, was among the few personal possessions common enough to turn up in shipwreck excavations centuries later.' },
  ],
  'french:tribunal': [
    { term: 'verdict', translation: 'verdict', fact: 'Under the Law of 22 Prairial, the Revolutionary Tribunal\'s verdict allowed only two outcomes: acquittal or death — no prison sentences in between.' },
    { term: 'accusation', translation: 'accusation', fact: "A public accusation before the Convention could be enough to open a case — the accused often learned the charge only once the tribunal was already in session." },
    { term: 'sentence', translation: 'sentence/ruling', fact: "Tribunal sentences during the Terror's height were sometimes handed down and carried out on the very same day." },
  ],
  'french:pamphletaire': [
    { term: 'pamphlet', translation: 'pamphlet', fact: 'Revolutionary Paris produced pamphlets by the thousands — some print shops turned around a new title within a day of a major event.' },
    { term: 'imprimerie', translation: 'print shop', fact: "The loosening of pre-revolutionary censorship in 1789 caused an explosion in Parisian print shops almost overnight — hundreds of new presses within a year." },
    { term: 'gazette', translation: 'gazette/newspaper', fact: 'Revolutionary gazettes ranged from sober parliamentary transcripts to openly partisan sheets — reading the news meant picking a political side by default.' },
  ],
  'french:sansCulotte': [
    { term: 'pique', translation: 'pike (weapon)', fact: 'The pike was the sans-culotte\'s signature weapon precisely because it required no expensive training or metalwork — any blacksmith could make one overnight.' },
    { term: 'bonnet', translation: 'cap (bonnet rouge)', fact: 'The red Phrygian "bonnet rouge" became the visual shorthand for revolutionary sympathy — even Louis XVI was made to wear one briefly during a 1792 crowd confrontation.' },
    { term: 'émeute', translation: 'riot/uprising', fact: 'Paris saw dozens of émeutes across the revolutionary decade — bread-price riots and political uprisings were often impossible to fully separate.' },
  ],
  'french:aristocrate': [
    { term: 'émigré', translation: 'émigré (fled noble)', fact: "Émigré nobles who fled abroad had their property legally confiscated by the Republic — many returned decades later, if at all, to find nothing left to reclaim." },
    { term: 'domaine', translation: 'estate', fact: "A noble domaine's feudal dues were abolished outright on the Night of August 4, 1789 — centuries of inherited income gone in a single Assembly session." },
    { term: 'blason', translation: 'coat of arms', fact: "Displaying a family blason in public became actively dangerous after 1792 — visible nobility was no longer a status symbol but a potential accusation." },
  ],
  'spanish:censor': [
    { term: 'tachadura', translation: 'redaction/strikeout', fact: 'Wartime censors on both sides physically struck through lines in letters and press copy — a tachadura thick enough that the original text underneath is sometimes still legible under raking light today.' },
    { term: 'imprenta', translation: 'printing press', fact: 'Republican and Nationalist zones each ran their press through state oversight — an approved imprenta stamp had to appear before a paper could legally distribute.' },
    { term: 'permiso', translation: 'permit/clearance', fact: 'Publishing almost anything during the war — from a newspaper column to a militia newsletter — required a permiso from the relevant political office first.' },
  ],
  'spanish:corresponsal': [
    { term: 'reportaje', translation: 'news report', fact: 'Foreign correspondents like Martha Gellhorn and Ernest Hemingway filed some of the war\'s most widely read reportaje from Madrid under bombardment.' },
    { term: 'crónica', translation: 'chronicle/dispatch', fact: 'A war crónica was expected to blend firsthand reporting with literary narrative — the line between journalism and literature was thin in Spanish Civil War coverage.' },
    { term: 'testigo', translation: 'witness', fact: 'Foreign correspondents were often the only independent testigos to events that combatant press on both sides had strong reasons to describe very differently.' },
  ],
  'spanish:miliciana': [
    { term: 'fusil', translation: 'rifle', fact: 'Early militia units were chronically short of matching rifles — photographs from 1936 show mismatched fusiles of half a dozen different makes and calibers in the same column.' },
    { term: 'consigna', translation: 'watchword/slogan', fact: '"¡No pasarán!" was itself a consigna — a rallying watchword meant to be shouted, chanted, and painted on walls, not just spoken.' },
    { term: 'compañera', translation: 'comrade (fem.)', fact: 'Republican militias were unusually open, for the era, to women serving in combat roles early in the war, before later policy pulled most women back to support roles.' },
  ],
  'spanish:abuelo': [
    { term: 'nostalgia', translation: 'nostalgia', fact: 'Spanish exiles\' nostalgia for a country many never saw again became its own literary genre — entire memoirs written by veterans who died abroad decades after the war ended.' },
    { term: 'silencio', translation: 'silence', fact: 'Under Franco, families on the losing side often kept a deliberate silencio about the war for their children\'s safety — many grandchildren only learned the full story generations later.' },
    { term: 'recuerdo', translation: 'memory/keepsake', fact: 'A veteran\'s recuerdo — a photograph, a button, a letter — was often the only physical trace a family kept of relatives who never came home from the front.' },
  ],
}

/**
 * Grants a persona's Ally word pack: three words auto-filed into the
 * archive, skipping any already present (same de-dup pattern as
 * seedSampleWords). Idempotent — safe to call more than once, though the
 * caller (see progression/affinity.js's allyRewardClaimed flag) only ever
 * calls it the first time a persona crosses into Ally.
 * @param {string} themeId
 * @param {string} personaId
 * @returns {Promise<{total: number, added: number}>}
 */
export async function grantAllyPack(themeId, personaId) {
  const pack = ALLY_PACKS[`${themeId}:${personaId}`] ?? []
  if (pack.length === 0) return { total: 0, added: 0 }

  const existing = await getWordsByTheme(themeId)
  const existingTerms = new Set(existing.map((w) => w.term.trim().toLowerCase()))

  let added = 0
  for (const { term, translation, fact } of pack) {
    if (existingTerms.has(term.toLowerCase())) continue
    await addWord({
      themeId,
      term,
      translation,
      fact,
      transliteration: getTransliteration(themeId, term),
    })
    added++
  }
  return { total: pack.length, added }
}
