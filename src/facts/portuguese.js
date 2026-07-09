/**
 * Curated, pre-authored trivia for the Portuguese/Age of Discovery theme,
 * keyed by the lowercased term. Each modern Portuguese word is paired with
 * the 15th-16th century maritime history its meaning descends from,
 * mirroring the Russian and Italian fact pools.
 * @type {Record<string, string>}
 */
export const PORTUGUESE_FACTS = {
  'caravela': 'Türkçe: "karavela". Latin yelkenleri sayesinde rüzgâra karşı seyredebilen bu gemi tipi, Atlantik keşiflerini teknik olarak mümkün kılan Portekiz icadıydı.',
  'descobrimento': 'Türkçe: "keşif". Dönemin tamamı Portekizce\'de hâlâ "Os Descobrimentos" (Keşifler) özel adıyla anılır.',
  'saudade': 'Türkçe: "derin özlem". Aylarca denizde kalan gemiciler ve Lizbon rıhtımında bekleyenlerin duygusunu anlatan, başka dile tam çevrilemeyen bu kelime bu çağda kültürel kimliğe dönüştü.',
  'especiarias': 'Türkçe: "baharatlar". Hindistan rotasının tek gerçek motivasyonuydu; bir gemi dolusu karabiber, seferin tüm masrafını kat kat çıkarırdı.',
  'astrolábio': 'Türkçe: "usturlap". Portekizli pilotlar güneşin yüksekliğinden enlem hesaplamak için bu aleti denizde kullanılır hale getirdi.',
  'roteiro': 'Türkçe: "güzergâh/senaryo". Aslen pilotların kıyı ve rota tariflerini yazdığı gizli seyir kılavuzlarıydı ve devlet sırrı sayılırdı.',
  'padrão': 'Türkçe: "standart/işaret sütunu". Keşfedilen her yeni kıyıya dikilen, Portekiz armalı taş sütunun adıydı; Diogo Cão\'nunkiler Afrika kıyısında hâlâ durur.',
  'monção': 'Türkçe: "muson". Arapçadan Portekizce\'ye bu çağda geçti; Hint Okyanusu\'nu geçmek tamamen muson rüzgârlarının takvimini bilmeye bağlıydı.',
  'leme': 'Türkçe: "dümen". Kıç bodoslama dümeni, karavelanın okyanus dalgalarında yönetilebilmesinin anahtarıydı.',
  'marinheiro': 'Türkçe: "denizci". Henrique dönemindeki Sagres çevresinde yetişen denizciler, Avrupa\'nın ilk sistematik eğitimli okyanus gemicileri kabul edilir.',
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getPortugueseFact(term) {
  return PORTUGUESE_FACTS[term.trim().toLowerCase()] ?? ''
}
