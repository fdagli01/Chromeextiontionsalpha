/**
 * "Double agent" words: false friends — terms that look like an English
 * word but mean something else entirely. The most notorious trap in real
 * language learning (Spanish "embarazada" is not "embarrassed"), reframed
 * in-world as an enemy agent traveling on convincing forged papers.
 *
 * When a reviewed word matches this list, the card gets a SUSPICIOUS
 * IDENTITY alarm and the lookalike English meaning is planted among the
 * answer options as the trap. Falling for the trap lets the agent slip
 * through (tension spikes to maximum); exposing them by picking the true
 * meaning pays bonus XP and counts toward counterintelligence badges.
 */

/** Bonus XP for exposing a double agent (picking the true meaning). */
export const DOUBLE_AGENT_BONUS_XP = 20

/**
 * @typedef {Object} FalseFriendDef
 * @property {string} term - the foreign word, matched case-insensitively
 * @property {string} trap - the tempting English lookalike meaning (WRONG)
 * @property {string} truth - what the word actually means
 * @property {string} note - one-line debrief shown after the answer
 */

/** @type {Record<string, FalseFriendDef[]>} */
export const FALSE_FRIENDS = {
  russian: [
    { term: 'магазин', trap: 'magazine', truth: 'shop', note: 'Looks like "magazine" — but a магазин is a shop. The press is журнал.' },
    { term: 'фамилия', trap: 'family', truth: 'surname', note: 'Not your family — your surname. Family is семья.' },
    { term: 'актуальный', trap: 'actual', truth: 'topical', note: 'Not "actual/real" — it means current, relevant right now.' },
    { term: 'симпатичный', trap: 'sympathetic', truth: 'good-looking', note: 'No sympathy involved — it means cute, nice-looking.' },
    { term: 'аккуратный', trap: 'accurate', truth: 'tidy', note: 'Not precision — neatness. An аккуратный desk is a tidy one.' },
    { term: 'интеллигентный', trap: 'intelligent', truth: 'cultured', note: 'Refers to refinement and manners, not raw brainpower.' },
    { term: 'декада', trap: 'decade', truth: 'ten days', note: 'A декада is ten DAYS, not ten years. Ten years is десятилетие.' },
    { term: 'кабинет', trap: 'cabinet', truth: 'office', note: 'Not furniture — a study or office room.' },
    { term: 'артист', trap: 'artist', truth: 'performer', note: 'A stage performer or actor. A painter is художник.' },
    { term: 'проспект', trap: 'prospect', truth: 'avenue', note: 'Невский проспект is an avenue, not an opportunity.' },
    { term: 'ангина', trap: 'angina', truth: 'tonsillitis', note: 'A sore throat, not a heart condition. Doctors have been confused.' },
    { term: 'бисквит', trap: 'biscuit', truth: 'sponge cake', note: 'Soft sponge cake — not a cookie, not a cracker.' },
  ],
  italian: [
    { term: 'camera', trap: 'camera', truth: 'room', note: 'A camera is a room. The photo device is macchina fotografica.' },
    { term: 'parente', trap: 'parent', truth: 'relative', note: 'Any relative — cousin, uncle, anyone. Parents are genitori.' },
    { term: 'fabbrica', trap: 'fabric', truth: 'factory', note: 'A factory. Fabric is tessuto or stoffa.' },
    { term: 'libreria', trap: 'library', truth: 'bookstore', note: 'Where books are SOLD. The lending kind is biblioteca.' },
    { term: 'morbido', trap: 'morbid', truth: 'soft', note: 'Nothing dark about it — it means soft to the touch.' },
    { term: 'caldo', trap: 'cold', truth: 'hot', note: 'The cruelest trap in Italian: caldo means HOT. Cold is freddo.' },
    { term: 'educato', trap: 'educated', truth: 'polite', note: 'About manners, not degrees. Educated is istruito.' },
    { term: 'attualmente', trap: 'actually', truth: 'currently', note: 'Means "at present". "Actually" is in realtà.' },
    { term: 'pretendere', trap: 'to pretend', truth: 'to demand', note: 'To insist on something — not to fake it (that is fingere).' },
    { term: 'rumore', trap: 'rumor', truth: 'noise', note: 'Just noise. A rumor is una voce.' },
    { term: 'confetti', trap: 'confetti', truth: 'sugared almonds', note: 'Wedding candy. The paper you throw is coriandoli.' },
    { term: 'argomento', trap: 'argument', truth: 'topic', note: 'A subject of discussion, not a quarrel (that is litigio).' },
  ],
  french: [
    { term: 'actuellement', trap: 'actually', truth: 'currently', note: 'Means "at the moment". "Actually" is en fait.' },
    { term: 'librairie', trap: 'library', truth: 'bookstore', note: 'Books for sale. The lending kind is bibliothèque.' },
    { term: 'blessé', trap: 'blessed', truth: 'wounded', note: 'Grimly opposite: blessé means injured. Blessed is béni.' },
    { term: 'attendre', trap: 'to attend', truth: 'to wait', note: 'To wait for. Attending is assister à — another trap.' },
    { term: 'rester', trap: 'to rest', truth: 'to stay', note: 'To remain somewhere. Resting is se reposer.' },
    { term: 'pain', trap: 'pain', truth: 'bread', note: 'The staff of life, not suffering. Pain is douleur.' },
    { term: 'coin', trap: 'coin', truth: 'corner', note: 'A corner or spot. A coin is une pièce.' },
    { term: 'monnaie', trap: 'money', truth: 'change', note: 'The coins in your pocket. Money in general is argent.' },
    { term: 'journée', trap: 'journey', truth: 'daytime', note: 'The span of a day. A journey is un voyage.' },
    { term: 'déception', trap: 'deception', truth: 'disappointment', note: 'Being let down, not lied to. Deceit is tromperie.' },
    { term: 'sensible', trap: 'sensible', truth: 'sensitive', note: 'Easily moved, not practical. Sensible is raisonnable.' },
    { term: 'location', trap: 'location', truth: 'rental', note: 'A rental. A place is un lieu or un endroit.' },
  ],
  portuguese: [
    { term: 'puxar', trap: 'to push', truth: 'to pull', note: 'Sounds like "push", means PULL. Doors everywhere claim victims.' },
    { term: 'esquisito', trap: 'exquisite', truth: 'weird', note: 'Strange, odd — a compliment gone very wrong.' },
    { term: 'pretender', trap: 'to pretend', truth: 'to intend', note: 'To plan to do something. Pretending is fingir.' },
    { term: 'pasta', trap: 'pasta', truth: 'folder', note: 'A folder or briefcase. The food is massa.' },
    { term: 'parentes', trap: 'parents', truth: 'relatives', note: 'All your kin. Parents specifically are pais.' },
    { term: 'costume', trap: 'costume', truth: 'custom', note: 'A habit or tradition. A costume is uma fantasia.' },
    { term: 'êxito', trap: 'exit', truth: 'success', note: 'A triumph, not a way out. The exit is saída.' },
    { term: 'livraria', trap: 'library', truth: 'bookstore', note: 'Books for sale. The lending kind is biblioteca.' },
    { term: 'atualmente', trap: 'actually', truth: 'currently', note: 'Means "nowadays". "Actually" is na verdade.' },
    { term: 'taxa', trap: 'tax', truth: 'fee', note: 'A fee or rate. The state\'s cut is imposto.' },
    { term: 'novela', trap: 'novel', truth: 'soap opera', note: 'A TV drama. The book is um romance.' },
    { term: 'lanche', trap: 'lunch', truth: 'snack', note: 'A light snack. Lunch is almoço.' },
  ],
  spanish: [
    { term: 'embarazada', trap: 'embarrassed', truth: 'pregnant', note: 'THE classic. Embarrassed is avergonzado. Choose carefully.' },
    { term: 'éxito', trap: 'exit', truth: 'success', note: 'A triumph, not a way out. The exit is salida.' },
    { term: 'ropa', trap: 'rope', truth: 'clothes', note: 'What you wear. Rope is cuerda.' },
    { term: 'carpeta', trap: 'carpet', truth: 'folder', note: 'Office supplies, not flooring. Carpet is alfombra.' },
    { term: 'sopa', trap: 'soap', truth: 'soup', note: 'You eat it. Soap is jabón — do not confuse in the kitchen.' },
    { term: 'librería', trap: 'library', truth: 'bookstore', note: 'Books for sale. The lending kind is biblioteca.' },
    { term: 'realizar', trap: 'to realize', truth: 'to carry out', note: 'To accomplish. Realizing something is darse cuenta.' },
    { term: 'asistir', trap: 'to assist', truth: 'to attend', note: 'To be present at. Helping is ayudar.' },
    { term: 'constipado', trap: 'constipated', truth: 'having a cold', note: 'A stuffy nose. The other thing is estreñido. Pharmacists know the look.' },
    { term: 'fábrica', trap: 'fabric', truth: 'factory', note: 'A factory. Fabric is tela.' },
    { term: 'sensible', trap: 'sensible', truth: 'sensitive', note: 'Easily moved, not practical. Sensible is sensato.' },
    { term: 'actualmente', trap: 'actually', truth: 'currently', note: 'Means "at present". "Actually" is en realidad.' },
  ],
}

/**
 * Looks up a term in the theme's double-agent roster.
 * @param {string} themeId
 * @param {string} term
 * @returns {FalseFriendDef | null}
 */
export function findFalseFriend(themeId, term) {
  const list = FALSE_FRIENDS[themeId]
  if (!list || !term) return null
  const needle = term.trim().toLowerCase()
  return list.find((f) => f.term.toLowerCase() === needle) ?? null
}
