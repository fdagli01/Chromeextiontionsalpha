/**
 * Curated, pre-authored trivia for the Italian/Roman theme, keyed by the
 * lowercased term. Each modern Italian word is paired with the Roman
 * history its meaning descends from — mirroring how the Russian theme
 * pairs modern words with Cold War facts. Deliberately not API-generated;
 * extend this pool over time as more common words get captured.
 * @type {Record<string, string>}
 */
export const ITALIAN_FACTS = {
  'senato': 'Türkçe: "senato". Roma Senatosu, MÖ 8. yüzyıldan itibaren devlet politikasını belirleyen, soylu ailelerden oluşan danışma meclisiydi.',
  'legione': 'Türkçe: "lejyon". Roma lejyonu ~5.000 askerden oluşurdu; her lejyonun kendi kartal standardı (aquila) vardı ve onu kaybetmek büyük bir onursuzluktu.',
  'console': 'Türkçe: "konsül". Cumhuriyet döneminde devletin başındaki iki konsül, birbirini denetlemek için bir yıllığına birlikte seçilirdi.',
  'gladiatore': 'Türkçe: "gladyatör". Gladyatörlerin çoğu köle veya savaş esiriydi; bazıları zaferleriyle özgürlüğünü (rudis) kazanabilirdi.',
  'imperatore': 'Türkçe: "imparator". "Imperator" başlangıçta sadece "başkomutan" anlamına geliyordu; Augustus\'la birlikte kalıcı bir unvana dönüştü.',
  'aquila': 'Türkçe: "kartal". Kartal, Roma lejyonlarının kutsal standardıydı (signum); MÖ 104\'te Marius reformuyla tüm lejyonların resmi simgesi oldu.',
  'colosseo': 'Türkçe: "Kolezyum". MS 80\'de açılan Kolezyum, aynı anda 50.000\'den fazla seyirciyi ağırlayabilen, dünyanın en büyük antik amfitiyatrosuydu.',
  'impero': 'Türkçe: "imparatorluk". Roma İmparatorluğu en geniş sınırlarına MS 117\'de, İmparator Traianus döneminde ulaştı.',
  'cittadino': 'Türkçe: "vatandaş". Roma vatandaşlığı (civitas) başlangıçta sadece Roma\'da doğanlara aitti; MS 212\'de Caracalla, imparatorluktaki tüm özgür erkeklere vatandaşlık verdi.',
  'centurione': 'Türkçe: "yüzbaşı". Centurio, ~80 askerlik bir birliği (centuria) yönetir, lejyonun disiplinini ve savaş deneyimini omuzlarında taşırdı.',
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getItalianFact(term) {
  return ITALIAN_FACTS[term.trim().toLowerCase()] ?? ''
}
