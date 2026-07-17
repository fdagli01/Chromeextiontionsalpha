import { getAffinityRecordsForTheme } from '../db/affinityRepo.js'
import { getPersonaById } from './mentors.js'

/** Trust threshold at which a persona leaves their memento on the desk. */
export const MEMENTO_TRUST_THRESHOLD = 50 // the Warm tier boundary

/**
 * Desk mementos: once a persona's trust crosses into Warm, they leave a
 * small personal object on the player's desk — a permanent trinket in the
 * popup's corner, one per persona, four per theme. Pure derivation from the
 * affinity store (trust >= threshold ⇒ memento present), so there is no
 * separate unlock record to migrate, back up, or get out of sync.
 * @typedef {Object} MementoDef
 * @property {string} icon
 * @property {string} name
 * @property {string} flavor - one line: what it is and why they left it
 */

/** @type {Record<string, MementoDef>} keyed "themeId:personaId" */
export const MEMENTOS = {
  'russian:handler': { icon: '🚬', name: 'Half-smoked papirosa', flavor: 'The Handler left it burning on your desk. He never stays long enough to finish one.' },
  'russian:cipherClerk': { icon: '📎', name: 'Red staple', flavor: 'From the Cipher Clerk\'s personal stapler. He counts them. He knows he gave you one.' },
  'russian:defector': { icon: '🎫', name: 'Faded Moscow train ticket', flavor: 'One way. The Defector says you should keep it — "in case you ever need to not exist."' },
  'russian:zealot': { icon: '📕', name: 'Pocket manifesto', flavor: 'The Zealot\'s own annotated copy. Every margin is full. He trusts you to read it properly.' },
  'italian:centurio': { icon: '🏅', name: 'Legion phalera', flavor: 'A campaign decoration from Aulus\'s own harness. "You drill like a soldier. Wear it like one."' },
  'italian:senator': { icon: '🪙', name: 'Silver sestertius', flavor: 'The Senator flipped it to you after a vote went his way. The emperor\'s face is worn smooth.' },
  'italian:oracle': { icon: '🍃', name: 'Faded laurel leaf', flavor: 'From the Oracle\'s crown. "It fell as you entered. That means something. It always means something."' },
  'italian:gladiator': { icon: '⏳', name: 'Arena sand', flavor: 'A pinch of sand from the Gladiator\'s last fight. He keeps the rest in his sandal. For luck.' },
  'portuguese:navigator': { icon: '⚙', name: 'Broken astrolabe gear', flavor: 'Mestre Henrique\'s first astrolabe, wrecked off Madeira. "The sea keeps the rest of it."' },
  'portuguese:cartographer': { icon: '🖋', name: 'Worn drafting quill', flavor: 'The Cartographer\'s spare. It has drawn three coastlines no one else has ever seen.' },
  'portuguese:priest': { icon: '📿', name: 'Bone rosary bead', flavor: 'A single bead from the Priest\'s rosary. He says the missing one prays for you now.' },
  'portuguese:stowaway': { icon: '🗞', name: 'Mermaid chart scrap', flavor: 'Torn from a chart margin — a mermaid drawn by a bored, frightened sailor. The Stowaway "found" it.' },
  'french:tribunal': { icon: '🕯', name: 'Broken royal seal', flavor: 'A cracked wax seal from a royal decree Laforge voided himself. He keeps the other half.' },
  'french:pamphletaire': { icon: '📰', name: 'First-edition pamphlet', flavor: 'The Pamphlétaire\'s first ever print run — smudged, crooked, and signed. "It gets better, I promise."' },
  'french:sansCulotte': { icon: '🧢', name: 'Red Phrygian cap', flavor: 'La Sans-Culotte\'s spare bonnet rouge. "For when you finally come down to the street with us."' },
  'french:aristocrate': { icon: '🧶', name: 'A strand from a tricoteuse\'s knitting', flavor: 'She unravelled it from a scarf knitted beside the scaffold. "A souvenir of terrible company, clerk."' },
  'spanish:censor': { icon: '✏️', name: 'Red editing pencil', flavor: 'The Censor\'s own pencil, worn to a stub. Everything it struck out, it remembers.' },
  'spanish:corresponsal': { icon: '🎞', name: 'Undeveloped film roll', flavor: 'The Correspondent left it with you. "If I don\'t come back, develop it. If I do — don\'t."' },
  'spanish:miliciana': { icon: '🫙', name: 'Brass shell casing', flavor: 'From La Miliciana\'s first day at the front. Polished bright. She doesn\'t say why she kept it.' },
  'spanish:abuelo': { icon: '🧣', name: 'Old wool scarf', flavor: 'El Abuelo insists you take it. "The front was cold. The desk is cold. Take the scarf."' },
}

/**
 * The mementos currently sitting on the desk for a theme — one for every
 * persona whose trust has reached Warm.
 * @param {string} themeId
 * @returns {Promise<Array<MementoDef & {personaId: string, personaName: string}>>}
 */
export async function getDeskMementos(themeId) {
  const records = await getAffinityRecordsForTheme(themeId)
  const result = []
  for (const record of records) {
    if (record.trust < MEMENTO_TRUST_THRESHOLD) continue
    const memento = MEMENTOS[`${themeId}:${record.personaId}`]
    if (!memento) continue
    const persona = getPersonaById(themeId, record.personaId)
    result.push({ ...memento, personaId: record.personaId, personaName: persona?.name ?? record.personaId })
  }
  return result
}
