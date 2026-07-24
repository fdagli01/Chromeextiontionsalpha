import { addWord, getWordsByTheme } from './wordsRepo.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'
import { falseFriendIntel } from '../progression/falseFriends.js'

/**
 * Hand-picked terms per theme (~22 each): the era's core vocabulary, plus
 * three false-friend "double agents" so the SUSPICIOUS IDENTITY mechanic
 * fires out of the box. Every term matches an entry already curated in
 * facts/*.js, so seeding attaches a fact/example/philosophy note and a
 * transliteration immediately — a new user has a real archive to review
 * without right-clicking around the web first. English translation is
 * supplied here since the normal capture flow gets it from a live
 * translation API call.
 *
 * Deliberately excludes every term in secrets/secrets.js: a secret handed
 * to everyone during onboarding is not a secret (enforced by test).
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
    // Era vocabulary with curated trivia already on file.
    { term: 'партия', translation: 'party' },
    { term: 'граница', translation: 'border' },
    { term: 'пропаганда', translation: 'propaganda' },
    { term: 'холодная война', translation: 'cold war' },
    { term: 'железный занавес', translation: 'iron curtain' },
    { term: 'пятилетка', translation: 'five-year plan' },
    { term: 'колхоз', translation: 'collective farm' },
    { term: 'диссидент', translation: 'dissident' },
    { term: 'оттепель', translation: 'the thaw' },
    { term: 'капитализм', translation: 'capitalism' },
    { term: 'бункер', translation: 'bunker' },
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
    // Era vocabulary with curated trivia already on file.
    { term: 'patrizio', translation: 'patrician' },
    { term: 'plebe', translation: 'plebs' },
    { term: 'foro', translation: 'forum' },
    { term: 'legato', translation: 'legate' },
    { term: 'barbaro', translation: 'barbarian' },
    { term: 'gloria', translation: 'glory' },
    { term: 'patria', translation: 'homeland' },
    { term: 'legge', translation: 'law' },
    { term: 'tempio', translation: 'temple' },
    { term: 'senatore', translation: 'senator' },
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
    // Era vocabulary with curated trivia already on file.
    { term: 'révolution', translation: 'revolution' },
    { term: 'république', translation: 'republic' },
    { term: 'monarchie', translation: 'monarchy' },
    { term: 'roi', translation: 'king' },
    { term: 'noblesse', translation: 'nobility' },
    { term: 'clergé', translation: 'clergy' },
    { term: 'tribunal', translation: 'tribunal' },
    { term: 'patriote', translation: 'patriot' },
    { term: 'aristocrate', translation: 'aristocrat' },
    { term: 'girondin', translation: 'Girondin' },
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
    // Era vocabulary with curated trivia already on file.
    { term: 'navegador', translation: 'navigator' },
    { term: 'colônia', translation: 'colony' },
    { term: 'ouro', translation: 'gold' },
    { term: 'bússola', translation: 'compass' },
    { term: 'vento', translation: 'wind' },
    { term: 'porto', translation: 'port' },
    { term: 'coroa', translation: 'crown' },
    { term: 'viagem', translation: 'voyage' },
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
    // Era vocabulary with curated trivia already on file.
    { term: 'guerra', translation: 'war' },
    { term: 'nacionalista', translation: 'nationalist' },
    { term: 'refugiado', translation: 'refugee' },
    { term: 'resistencia', translation: 'resistance' },
    { term: 'dictadura', translation: 'dictatorship' },
    { term: 'democracia', translation: 'democracy' },
    { term: 'huelga', translation: 'strike' },
    { term: 'sindicato', translation: 'trade union' },
    { term: 'paz', translation: 'peace' },
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
      // A false friend with no curated trivia explains its own disguise.
      fact: getFact(themeId, term) || falseFriendIntel(themeId, term),
      transliteration: getTransliteration(themeId, term),
      exampleSentence: example?.sentence ?? '',
      exampleTranslation: example?.translation ?? '',
      philosophyNote: getPhilosophy(themeId, term),
    })
    added++
  }

  return { total: samples.length, added }
}
