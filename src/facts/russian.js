/**
 * Curated, pre-authored trivia for the Russian/Cold War theme, keyed by the
 * lowercased term. Deliberately not API-generated: each entry is a small,
 * checked historical note rather than a generic filler fact. Extend this
 * pool over time; unmatched terms simply get no trivia, which is preferable
 * to attaching a misleading generic blurb.
 * @type {Record<string, string>}
 */
export const RUSSIAN_FACTS = {
  'товарищ': 'Türkçe: "yoldaş". Sovyet döneminde resmi hitap şekliydi ve sınıf ayrımını reddeden bir eşitlik ifadesiydi.',
  'спутник': 'Türkçe: "uydu". 1957\'de fırlatılan Sputnik 1, uzay yarışını başlatan ilk yapay Dünya uydusuydu.',
  'гласность': 'Türkçe: "açıklık". Gorbaçov\'un 1980\'lerdeki şeffaflık politikasının adıydı, Sovyet basın sansürünü gevşetti.',
  'перестройка': 'Türkçe: "yeniden yapılanma". Gorbaçov\'un ekonomik ve siyasi reform programının adıydı, SSCB\'nin çöküşüne zemin hazırladı.',
  'кремль': 'Türkçe: "kale/hisar". Moskova Kremlin\'i, Rus hükümetinin simgesi haline geldi; kelimenin kendisi bir iç kale anlamına gelir.',
  'шпион': 'Türkçe: "casus". Soğuk Savaş boyunca KGB ve CIA arasındaki casus takası operasyonları (Glienicke Köprüsü gibi) efsaneleşmiştir.',
  'агент': 'Türkçe: "ajan". KGB\'nin kod adlı ajanları, Batı istihbarat servislerine sızmak için onlarca yıl derin örtü (deep cover) kimlikleriyle yaşadı.',
  'секрет': 'Türkçe: "sır". "Совершенно секретно" ("Tamamen gizli") Sovyet belgelerinde en yüksek gizlilik derecesiydi.',
  'свобода': 'Türkçe: "özgürlük". "Radio Svoboda" (Özgürlük Radyosu), Soğuk Savaş boyunca Demir Perde\'nin arkasına sansürsüz yayın yapan bir ABD destekli istasyondu.',
  'граница': 'Türkçe: "sınır". Demir Perde boyunca uzanan sınırlar, dünyanın en ağır korunan ve mayınlı bölgeleriydi.',
  'ракета': 'Türkçe: "roket". Sovyet roket programı 1957\'de dünyanın ilk kıtalararası balistik füzesini (R-7) geliştirdi.',
  'революция': 'Türkçe: "devrim". 1917 Ekim Devrimi, Bolşevikleri iktidara taşıyarak SSCB\'nin kuruluşuna zemin hazırladı.',
  'партия': 'Türkçe: "parti". Sovyetler Birliği Komünist Partisi (KPSS), ülkenin tek yasal siyasi partisiydi ve devletin tüm kademelerini kontrol ederdi.',
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianFact(term) {
  return RUSSIAN_FACTS[term.trim().toLowerCase()] ?? ''
}
