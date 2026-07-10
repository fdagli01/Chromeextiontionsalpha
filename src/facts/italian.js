/**
 * Curated, pre-authored content for the Italian/Roman theme, keyed by the
 * lowercased term. Mirrors russian.js's shape: fact + example sentence +
 * optional philosophy note for the most conceptually loaded words.
 * @type {Record<string, {fact: string, example: string, exampleTranslation: string, philosophy?: string}>}
 */
export const ITALIAN_ENTRIES = {
  'senato': {
    fact: 'Türkçe: "senato". Roma Senatosu, MÖ 8. yüzyıldan itibaren devlet politikasını belirleyen, soylu ailelerden oluşan danışma meclisiydi.',
    example: 'Il Senato si riuniva per discutere le leggi.',
    exampleTranslation: 'Senato, yasaları tartışmak için toplanırdı.',
    philosophy: "Cicero'nun res publica (\"kamu malı\") kavramı, devletin tek bir kişinin değil ortak müzakerenin ürünü olması gerektiğini savunur — Senato bu ideali kurumsallaştırıyordu.",
  },
  'legione': {
    fact: 'Türkçe: "lejyon". Roma lejyonu ~5.000 askerden oluşurdu; her lejyonun kendi kartal standardı (aquila) vardı ve onu kaybetmek büyük bir onursuzluktu.',
    example: 'La legione marciò per tre giorni.',
    exampleTranslation: 'Lejyon üç gün yürüdü.',
  },
  'console': {
    fact: 'Türkçe: "konsül". Cumhuriyet döneminde devletin başındaki iki konsül, birbirini denetlemek için bir yıllığına birlikte seçilirdi.',
    example: 'I due consoli governavano insieme per un anno.',
    exampleTranslation: 'İki konsül bir yıl boyunca birlikte yönetirdi.',
  },
  'gladiatore': {
    fact: 'Türkçe: "gladyatör". Gladyatörlerin çoğu köle veya savaş esiriydi; bazıları zaferleriyle özgürlüğünü (rudis) kazanabilirdi.',
    example: 'Il gladiatore combatté coraggiosamente nell\'arena.',
    exampleTranslation: 'Gladyatör arenada cesurca savaştı.',
    philosophy: "Seneca, mektuplarında gladyatör dövüşlerini izlemenin ruhu kabalaştırdığını yazar — Stoacılık'ın ölüm karşısında soğukkanlılığı, arenanın kitlesel eğlence olarak sunduğu ölümle tezat oluşturur.",
  },
  'imperatore': {
    fact: 'Türkçe: "imparator". "Imperator" başlangıçta sadece "başkomutan" anlamına geliyordu; Augustus\'la birlikte kalıcı bir unvana dönüştü.',
    example: "L'imperatore governava su tutto l'impero.",
    exampleTranslation: 'İmparator, tüm imparatorluğu yönetiyordu.',
    philosophy: "Machiavelli, Hükümdar'da Augustus'un cumhuriyetçi görüntüyü koruyarak fiilen tek adam yönetimi kurmasını, virtù (siyasi ustalık) örneği olarak över.",
  },
  'aquila': {
    fact: 'Türkçe: "kartal". Kartal, Roma lejyonlarının kutsal standardıydı (signum); MÖ 104\'te Marius reformuyla tüm lejyonların resmi simgesi oldu.',
    example: "L'aquila era il simbolo della legione.",
    exampleTranslation: 'Kartal, lejyonun simgesiydi.',
  },
  'colosseo': {
    fact: 'Türkçe: "Kolezyum". MS 80\'de açılan Kolezyum, aynı anda 50.000\'den fazla seyirciyi ağırlayabilen, dünyanın en büyük antik amfitiyatrosuydu.',
    example: 'Migliaia di persone si riunivano al Colosseo.',
    exampleTranslation: "Binlerce kişi Kolezyum'da toplanırdı.",
  },
  'impero': {
    fact: 'Türkçe: "imparatorluk". Roma İmparatorluğu en geniş sınırlarına MS 117\'de, İmparator Traianus döneminde ulaştı.',
    example: 'L\'impero si estendeva su tre continenti.',
    exampleTranslation: 'İmparatorluk üç kıtaya yayılıyordu.',
    philosophy: "Polybius'un \"anayasaların döngüsü\" (anacyclosis) teorisi, Roma'nın Krallık→Cumhuriyet→İmparatorluk evrimini, her yönetim biçiminin kaçınılmaz olarak yozlaşıp bir sonrakine dönüştüğü bir döngü olarak okur.",
  },
  'cittadino': {
    fact: 'Türkçe: "vatandaş". Roma vatandaşlığı (civitas) başlangıçta sadece Roma\'da doğanlara aitti; MS 212\'de Caracalla, imparatorluktaki tüm özgür erkeklere vatandaşlık verdi.',
    example: 'Ogni cittadino aveva doveri verso lo stato.',
    exampleTranslation: 'Her vatandaşın devlete karşı görevleri vardı.',
    philosophy: "Aristoteles'in Politika'sındaki \"insan doğası gereği politik bir hayvandır\" (zoon politikon) tezi, Roma vatandaşlığının neden sadece hukuki değil ahlaki bir kimlik sayıldığını açıklar.",
  },
  'centurione': {
    fact: 'Türkçe: "yüzbaşı". Centurio, ~80 askerlik bir birliği (centuria) yönetir, lejyonun disiplinini ve savaş deneyimini omuzlarında taşırdı.',
    example: 'Il centurione comandava ottanta soldati.',
    exampleTranslation: 'Yüzbaşı seksen askere komuta ediyordu.',
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getItalianFact(term) {
  return ITALIAN_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getItalianExample(term) {
  const entry = ITALIAN_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getItalianPhilosophy(term) {
  return ITALIAN_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
