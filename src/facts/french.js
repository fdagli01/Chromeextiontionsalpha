/**
 * Curated, pre-authored content for the French/Revolution theme, keyed by
 * the lowercased term. Mirrors russian.js's shape: fact + example sentence
 * + optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const FRENCH_ENTRIES = {
  'citoyen': {
    fact: 'Türkçe: "yurttaş". Devrim\'de "Monsieur/Madame" hitabı yasaklanıp "Citoyen/Citoyenne" zorunlu hitap oldu; bugün hâlâ "vatandaş" demek.',
    example: 'Chaque citoyen avait le droit de voter.',
    exampleTranslation: 'Her yurttaşın oy kullanma hakkı vardı.',
    philosophy: "Rousseau'da yurttaşlık, sadece haklara sahip olmak değil \"genel irade\"ye (volonté générale) katılmaktır — kişisel çıkarını toplumun ortak iyiliğine tabi kılma erdemidir.",
  },
  'liberté': {
    fact: 'Türkçe: "özgürlük". 1789 İnsan ve Yurttaş Hakları Bildirisi\'nin 1. maddesinin kelimesi; cumhuriyet mottosunun ilk sözcüğü.',
    example: 'La liberté est un droit fondamental.',
    exampleTranslation: 'Özgürlük, temel bir haktır.',
    philosophy: "Rousseau'nun Toplum Sözleşmesi'ndeki ünlü cümlesi — \"insan özgür doğar, oysa her yerde zincire vurulmuştur\" — liberté'yi doğal bir hak değil, adil bir toplum sözleşmesiyle yeniden kazanılması gereken bir şey olarak sunar.",
  },
  'fraternité': {
    fact: 'Türkçe: "kardeşlik". Mottoya en geç eklenen kavramdı (1790\'lar); bugün Fransız anayasasında yazılıdır.',
    example: 'La fraternité unit tous les citoyens.',
    exampleTranslation: 'Kardeşlik, tüm yurttaşları birleştirir.',
    philosophy: "Kant'ın \"amaçlar krallığı\" (Reich der Zwecke) kavramı, her insanı araç değil amaç olarak görme ilkesiyle fraternité'nin evrensel bir ahlak yasasına dönüşme potansiyelini taşır.",
  },
  'guillotine': {
    fact: 'Türkçe: "giyotin". Adını "eşitlikçi idam" öneren Dr. Guillotin\'den alır; modern Fransızca\'da mecazen "acımasızca kesip atmak" için de kullanılır.',
    example: 'La guillotine fut utilisée pendant la Révolution.',
    exampleTranslation: "Giyotin, Devrim sırasında kullanıldı.",
  },
  'terreur': {
    fact: 'Türkçe: "terör/dehşet". 1793-94 Terör Dönemi\'ne (la Terreur) adını verdi; bugün "dehşet" anlamında günlük bir kelime.',
    example: 'La Terreur dura environ un an.',
    exampleTranslation: 'Terör Dönemi yaklaşık bir yıl sürdü.',
    philosophy: "Robespierre'in \"erdemsiz terör güçsüzdür, terörsüz erdem de etkisizdir\" sözü, Hannah Arendt'in Devrim Üzerine'de incelediği paradoksu özetler: özgürlüğü korumak için özgürlüğü askıya alma zorunluluğu.",
  },
  'veto': {
    fact: 'Türkçe: "veto". XVI. Louis\'nin askıya alıcı veto yetkisi yüzünden halk kral ve kraliçeye "Monsieur/Madame Veto" lakabını taktı; kelime bugün tüm siyasette yaşıyor.',
    example: 'Le roi utilisa son droit de veto.',
    exampleTranslation: 'Kral, veto hakkını kullandı.',
  },
  'assemblée': {
    fact: 'Türkçe: "meclis". 1789 Jeu de Paume yemini ile doğan Assemblée nationale, bugün hâlâ Fransız parlamentosunun adıdır.',
    example: "L'Assemblée nationale vota la nouvelle loi.",
    exampleTranslation: 'Ulusal Meclis, yeni yasayı oyladı.',
  },
  'la gauche': {
    fact: 'Türkçe: "sol (siyasi)". Siyasi "sol" ve "sağ" kavramları 1789\'da Meclis\'te vekillerin kralın yanında/karşısında oturma düzeninden doğdu.',
    example: 'La gauche siégeait à côté du président.',
    exampleTranslation: 'Sol, başkanın yanında oturuyordu.',
    philosophy: "Norberto Bobbio, Sağ ve Sol'da bu ayrımın özünde eşitlik (sol) ile hiyerarşiyi doğal kabul etme (sağ) arasındaki tutum farkı olduğunu savunur — 1789 Meclisi'ndeki oturma düzeni, bu felsefi eksenin doğduğu andı.",
  },
  'mètre': {
    fact: 'Türkçe: "metre". Metrik sistem, Devrim\'in "ölçüyü herkes için eşitleme" projesiyle 1795\'te yasalaştı; kelime oradan dünyaya yayıldı.',
    example: "Le mètre devint l'unité officielle de mesure.",
    exampleTranslation: 'Metre, resmi ölçü birimi oldu.',
  },
  'vandalisme': {
    fact: 'Türkçe: "vandalizm". 1794\'te Rahip Grégoire tarafından devrimcilerin anıt yıkımını tanımlamak için türetildi; bugün evrensel bir kelime.',
    example: 'Le vandalisme des monuments fut condamné.',
    exampleTranslation: 'Anıtların tahrip edilmesi (vandalizm) kınandı.',
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getFrenchFact(term) {
  return FRENCH_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getFrenchExample(term) {
  const entry = FRENCH_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getFrenchPhilosophy(term) {
  return FRENCH_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
