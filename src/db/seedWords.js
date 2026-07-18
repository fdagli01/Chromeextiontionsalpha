import { addWord, getWordsByTheme } from './wordsRepo.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'

/**
 * Hand-picked terms per theme (10 era words + 3 false-friend "double
 * agents"), most matching an entry already curated in
 * facts/*.js — so seeding immediately attaches a fact/example/philosophy
 * note, giving a new user something to review without right-clicking
 * around the web first. English translation is supplied here since the
 * normal capture flow gets it from a live translation API call.
 * @type {Record<string, {term: string, translation: string}[]>}
 */
const SEED_WORDS = {
  russian: [
    { term: 'товарищ', translation: 'comrade' },
    { term: 'спутник', translation: 'satellite' },
    { term: 'гласность', translation: 'openness' },
    { term: 'перестройка', translation: 'restructuring' },
    { term: 'кремль', translation: 'kremlin' },
    { term: 'шпион', translation: 'spy' },
    { term: 'агент', translation: 'agent' },
    { term: 'секрет', translation: 'secret' },
    { term: 'свобода', translation: 'freedom' },
    { term: 'революция', translation: 'revolution' },
    // Double agents (false friends — see progression/falseFriends.js), so
    // the SUSPICIOUS IDENTITY mechanic fires out of the box.
    { term: 'магазин', translation: 'shop' },
    { term: 'фамилия', translation: 'surname' },
    { term: 'кабинет', translation: 'office' },
  ],
  italian: [
    { term: 'senato', translation: 'senate' },
    { term: 'legione', translation: 'legion' },
    { term: 'console', translation: 'consul' },
    { term: 'gladiatore', translation: 'gladiator' },
    { term: 'imperatore', translation: 'emperor' },
    { term: 'aquila', translation: 'eagle' },
    { term: 'colosseo', translation: 'colosseum' },
    { term: 'impero', translation: 'empire' },
    { term: 'cittadino', translation: 'citizen' },
    { term: 'centurione', translation: 'centurion' },
    // Double agents (false friends).
    { term: 'camera', translation: 'room' },
    { term: 'caldo', translation: 'hot' },
    { term: 'parente', translation: 'relative' },
  ],
  french: [
    { term: 'citoyen', translation: 'citizen' },
    { term: 'liberté', translation: 'liberty' },
    { term: 'fraternité', translation: 'fraternity' },
    { term: 'guillotine', translation: 'guillotine' },
    { term: 'terreur', translation: 'terror' },
    { term: 'veto', translation: 'veto' },
    { term: 'assemblée', translation: 'assembly' },
    { term: 'la gauche', translation: 'the left' },
    { term: 'mètre', translation: 'meter' },
    { term: 'vandalisme', translation: 'vandalism' },
    // Double agents (false friends).
    { term: 'pain', translation: 'bread' },
    { term: 'blessé', translation: 'wounded' },
    { term: 'journée', translation: 'daytime' },
  ],
  portuguese: [
    { term: 'caravela', translation: 'caravel' },
    { term: 'descobrimento', translation: 'discovery' },
    { term: 'saudade', translation: 'longing' },
    { term: 'especiarias', translation: 'spices' },
    { term: 'astrolábio', translation: 'astrolabe' },
    { term: 'roteiro', translation: 'route log' },
    { term: 'padrão', translation: 'marker pillar' },
    { term: 'monção', translation: 'monsoon' },
    { term: 'leme', translation: 'rudder' },
    { term: 'marinheiro', translation: 'sailor' },
    // Double agents (false friends).
    { term: 'puxar', translation: 'to pull' },
    { term: 'esquisito', translation: 'weird' },
    { term: 'êxito', translation: 'success' },
  ],
  spanish: [
    { term: 'milicia', translation: 'militia' },
    { term: 'frente', translation: 'front' },
    { term: 'censura', translation: 'censorship' },
    { term: 'republicano', translation: 'republican' },
    { term: 'sublevación', translation: 'uprising' },
    { term: 'trinchera', translation: 'trench' },
    { term: 'exilio', translation: 'exile' },
    { term: 'brigada', translation: 'brigade' },
    { term: 'bombardeo', translation: 'bombing' },
    { term: 'no pasarán', translation: 'they shall not pass' },
    // Double agents (false friends).
    { term: 'embarazada', translation: 'pregnant' },
    { term: 'éxito', translation: 'success' },
    { term: 'ropa', translation: 'clothes' },
  ],
}

/**
 * Adds this theme's sample words to the archive, skipping any term already
 * captured. Each word is inserted with its curated fact/example/philosophy/
 * transliteration already attached, exactly as a live capture would fetch.
 * @param {string} themeId
 * @returns {Promise<{total: number, added: number}>}
 */
export async function seedSampleWords(themeId) {
  const samples = SEED_WORDS[themeId] ?? []
  if (samples.length === 0) return { total: 0, added: 0 }

  const existing = await getWordsByTheme(themeId)
  const existingTerms = new Set(existing.map((w) => w.term.trim().toLowerCase()))

  let added = 0
  for (const { term, translation } of samples) {
    if (existingTerms.has(term.toLowerCase())) continue

    const example = getExample(themeId, term)
    await addWord({
      themeId,
      term,
      translation,
      fact: getFact(themeId, term),
      transliteration: getTransliteration(themeId, term),
      exampleSentence: example?.sentence ?? '',
      exampleTranslation: example?.translation ?? '',
      philosophyNote: getPhilosophy(themeId, term),
    })
    added++
  }

  return { total: samples.length, added }
}
