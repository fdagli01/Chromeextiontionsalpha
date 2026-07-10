/**
 * Curated, pre-authored content for the Portuguese/Age of Discovery theme,
 * keyed by the lowercased term. Mirrors russian.js's shape: fact + example
 * sentence + optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const PORTUGUESE_ENTRIES = {
  'caravela': {
    fact: 'Türkçe: "karavela". Latin yelkenleri sayesinde rüzgâra karşı seyredebilen bu gemi tipi, Atlantik keşiflerini teknik olarak mümkün kılan Portekiz icadıydı.',
    example: 'A caravela navegava contra o vento.',
    exampleTranslation: 'Karavela, rüzgâra karşı seyrediyordu.',
  },
  'descobrimento': {
    fact: 'Türkçe: "keşif". Dönemin tamamı Portekizce\'de hâlâ "Os Descobrimentos" (Keşifler) özel adıyla anılır.',
    example: 'O descobrimento do Brasil ocorreu em mil e quinhentos.',
    exampleTranslation: "Brezilya'nın keşfi 1500 yılında gerçekleşti.",
    philosophy: "Francis Bacon'ın Novum Organum'daki deneysel bilgi anlayışı — doğayı gözlemleyip test ederek öğrenme — Keşifler Çağı'nın pratik navigasyon bilgisiyle aynı köke, Ortaçağ'ın kitabi otoriteye dayalı bilgi anlayışının reddine dayanır.",
  },
  'saudade': {
    fact: 'Türkçe: "derin özlem". Aylarca denizde kalan gemiciler ve Lizbon rıhtımında bekleyenlerin duygusunu anlatan, başka dile tam çevrilemeyen bu kelime bu çağda kültürel kimliğe dönüştü.',
    example: 'Sinto muita saudade da minha terra.',
    exampleTranslation: 'Memleketimi çok özlüyorum (derin bir hasretle).',
    philosophy: "Fernando Pessoa'nın \"saudosismo\"su, saudade'yi sadece özlem değil, hiç yaşanmamış ya da geri gelmeyecek bir şeyin varlığını hissetme hali olarak tanımlar — fenomenolojik bir zaman deneyimi.",
  },
  'especiarias': {
    fact: 'Türkçe: "baharatlar". Hindistan rotasının tek gerçek motivasyonuydu; bir gemi dolusu karabiber, seferin tüm masrafını kat kat çıkarırdı.',
    example: 'As especiarias valiam mais do que ouro.',
    exampleTranslation: 'Baharatlar altından daha değerliydi.',
  },
  'astrolábio': {
    fact: 'Türkçe: "usturlap". Portekizli pilotlar güneşin yüksekliğinden enlem hesaplamak için bu aleti denizde kullanılır hale getirdi.',
    example: 'O piloto usava o astrolábio para calcular a latitude.',
    exampleTranslation: 'Kılavuz kaptan, enlemi hesaplamak için usturlap kullanırdı.',
    philosophy: "Usturlap, doğayı sayılara indirgeyen rasyonalist dünya görüşünün somut bir aracıdır — gökyüzünü ölçülebilir kılmak, Galileo'dan önceki \"evren matematik diliyle yazılmıştır\" sezgisinin erken bir uygulamasıdır.",
  },
  'roteiro': {
    fact: 'Türkçe: "güzergâh/senaryo". Aslen pilotların kıyı ve rota tariflerini yazdığı gizli seyir kılavuzlarıydı ve devlet sırrı sayılırdı.',
    example: 'O roteiro da viagem era um segredo de estado.',
    exampleTranslation: 'Yolculuğun rota kılavuzu bir devlet sırrıydı.',
  },
  'padrão': {
    fact: 'Türkçe: "standart/işaret sütunu". Keşfedilen her yeni kıyıya dikilen, Portekiz armalı taş sütunun adıydı; Diogo Cão\'nunkiler Afrika kıyısında hâlâ durur.',
    example: 'O padrão marcava a nova terra descoberta.',
    exampleTranslation: 'Sütun, yeni keşfedilen toprağı işaretliyordu.',
  },
  'monção': {
    fact: 'Türkçe: "muson". Arapçadan Portekizce\'ye bu çağda geçti; Hint Okyanusu\'nu geçmek tamamen muson rüzgârlarının takvimini bilmeye bağlıydı.',
    example: 'Os navios esperavam a monção para partir.',
    exampleTranslation: 'Gemiler yola çıkmak için muson rüzgârını beklerdi.',
  },
  'leme': {
    fact: 'Türkçe: "dümen". Kıç bodoslama dümeni, karavelanın okyanus dalgalarında yönetilebilmesinin anahtarıydı.',
    example: 'O leme quebrou durante a tempestade.',
    exampleTranslation: 'Dümen, fırtına sırasında kırıldı.',
  },
  'marinheiro': {
    fact: 'Türkçe: "denizci". Henrique dönemindeki Sagres çevresinde yetişen denizciler, Avrupa\'nın ilk sistematik eğitimli okyanus gemicileri kabul edilir.',
    example: 'O marinheiro passou anos no mar.',
    exampleTranslation: 'Denizci, denizde yıllar geçirdi.',
    philosophy: "Camões'in Os Lusíadas destanı, denizciyi klasik kahramanlık idealini (Homeros'un Odysseus'u) Hıristiyan Rönesans hümanizmiyle birleştiren yeni bir figür olarak resmeder.",
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getPortugueseFact(term) {
  return PORTUGUESE_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getPortugueseExample(term) {
  const entry = PORTUGUESE_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getPortuguesePhilosophy(term) {
  return PORTUGUESE_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
