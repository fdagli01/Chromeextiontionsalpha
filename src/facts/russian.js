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
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianFact(term) {
  return RUSSIAN_FACTS[term.trim().toLowerCase()] ?? ''
}
