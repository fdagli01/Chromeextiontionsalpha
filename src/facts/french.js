/**
 * Curated, pre-authored trivia for the French/Revolution theme, keyed by
 * the lowercased term. Each modern French word is paired with the history
 * of the Revolution its meaning descends from, mirroring the Russian,
 * Italian, and Portuguese fact pools.
 * @type {Record<string, string>}
 */
export const FRENCH_FACTS = {
  'citoyen': 'Türkçe: "yurttaş". Devrim\'de "Monsieur/Madame" hitabı yasaklanıp "Citoyen/Citoyenne" zorunlu hitap oldu; bugün hâlâ "vatandaş" demek.',
  'liberté': 'Türkçe: "özgürlük". 1789 İnsan ve Yurttaş Hakları Bildirisi\'nin 1. maddesinin kelimesi; cumhuriyet mottosunun ilk sözcüğü.',
  'fraternité': 'Türkçe: "kardeşlik". Fransız mottosuna en geç eklenen kavramdı (1790\'lar); bugün Fransız anayasasında yazılıdır.',
  'guillotine': 'Türkçe: "giyotin". Adını "eşitlikçi idam" öneren Dr. Guillotin\'den alır; modern Fransızca\'da mecazen "acımasızca kesip atmak" için de kullanılır.',
  'terreur': 'Türkçe: "terör/dehşet". 1793-94 Terör Dönemi\'ne (la Terreur) adını verdi; bugün "dehşet" anlamında günlük bir kelime.',
  'veto': 'Türkçe: "veto". XVI. Louis\'nin askıya alıcı veto yetkisi yüzünden halk kral ve kraliçeye "Monsieur/Madame Veto" lakabını taktı; kelime bugün tüm siyasette yaşıyor.',
  'assemblée': 'Türkçe: "meclis". 1789 Jeu de Paume yemini ile doğan Assemblée nationale, bugün hâlâ Fransız parlamentosunun adıdır.',
  'la gauche': 'Türkçe: "sol (siyasi)". Siyasi "sol" ve "sağ" kavramları 1789\'da Meclis\'te vekillerin kralın yanında/karşısında oturma düzeninden doğdu.',
  'mètre': 'Türkçe: "metre". Metrik sistem, Devrim\'in "ölçüyü herkes için eşitleme" projesiyle 1795\'te yasalaştı; kelime oradan dünyaya yayıldı.',
  'vandalisme': 'Türkçe: "vandalizm". 1794\'te Rahip Grégoire tarafından devrimcilerin anıt yıkımını tanımlamak için türetildi; bugün evrensel bir kelime.',
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getFrenchFact(term) {
  return FRENCH_FACTS[term.trim().toLowerCase()] ?? ''
}
