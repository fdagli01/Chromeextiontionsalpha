/**
 * Curated, pre-authored content for the Russian/Cold War theme, keyed by
 * the lowercased term. Each entry pairs a modern Russian word with (a) a
 * checked historical note, (b) an example sentence + Turkish translation,
 * and (c) for the most conceptually loaded words, a one-line philosophical
 * cross-reference. Deliberately not API-generated; extend this pool over
 * time. Unmatched terms simply get nothing, which is preferable to a
 * misleading generic blurb.
 * @typedef {Object} RussianEntry
 * @property {string} fact
 * @property {string} example
 * @property {string} exampleTranslation
 * @property {string} [philosophy]
 * @type {Record<string, RussianEntry>}
 */
export const RUSSIAN_ENTRIES = {
  'товарищ': {
    fact: 'Türkçe: "yoldaş". Sovyet döneminde resmi hitap şekliydi ve sınıf ayrımını reddeden bir eşitlik ifadesiydi.',
    example: 'Товарищ, помогите мне, пожалуйста.',
    exampleTranslation: 'Yoldaş, lütfen bana yardım edin.',
    philosophy: "Marx'ın sınıfsız toplum idealinde \"yoldaş\" hitabı, bireyler arası hiyerarşiyi değil ortak emeği ve eşitliği vurgular — burjuva \"efendi/hizmetkâr\" dilinin bilinçli bir reddiydi.",
  },
  'спутник': {
    fact: 'Türkçe: "uydu". 1957\'de fırlatılan Sputnik 1, uzay yarışını başlatan ilk yapay Dünya uydusuydu.',
    example: 'Первый спутник запустили в тысяча девятьсот пятьдесят седьмом году.',
    exampleTranslation: "İlk uydu 1957'de fırlatıldı.",
  },
  'гласность': {
    fact: 'Türkçe: "açıklık". Gorbaçov\'un 1980\'lerdeki şeffaflık politikasının adıydı, Sovyet basın sansürünü gevşetti.',
    example: 'Политика гласности изменила советское общество.',
    exampleTranslation: 'Açıklık politikası Sovyet toplumunu değiştirdi.',
    philosophy: "Gorbaçov'un gласность ilkesi, J.S. Mill'in Özgürlük Üzerine'deki \"fikirlerin serbest çarpışması gerçeği ortaya çıkarır\" tezine yakındır — sansürün hakikati değil sadece iktidarı koruduğu fikri.",
  },
  'перестройка': {
    fact: 'Türkçe: "yeniden yapılanma". Gorbaçov\'un ekonomik ve siyasi reform programının adıydı, SSCB\'nin çöküşüne zemin hazırladı.',
    example: 'Перестройка началась в тысяча девятьсот восемьдесят пятом году.',
    exampleTranslation: "Yeniden yapılanma 1985'te başladı.",
  },
  'кремль': {
    fact: 'Türkçe: "kale/hisar". Moskova Kremlin\'i, Rus hükümetinin simgesi haline geldi; kelimenin kendisi bir iç kale anlamına gelir.',
    example: 'Кремль находится в центре Москвы.',
    exampleTranslation: "Kremlin, Moskova'nın merkezinde bulunur.",
  },
  'шпион': {
    fact: 'Türkçe: "casus". Soğuk Savaş boyunca KGB ve CIA arasındaki casus takası operasyonları (Glienicke Köprüsü gibi) efsaneleşmiştir.',
    example: 'Этот человек оказался иностранным шпионом.',
    exampleTranslation: 'Bu adamın yabancı bir casus olduğu ortaya çıktı.',
  },
  'агент': {
    fact: 'Türkçe: "ajan". KGB\'nin kod adlı ajanları, Batı istihbarat servislerine sızmak için onlarca yıl derin örtü (deep cover) kimlikleriyle yaşadı.',
    example: 'Агент передал секретное сообщение.',
    exampleTranslation: 'Ajan gizli mesajı iletti.',
  },
  'секрет': {
    fact: 'Türkçe: "sır". "Совершенно секретно" ("Tamamen gizli") Sovyet belgelerinde en yüksek gizlilik derecesiydi.',
    example: 'Это совершенно секретная информация.',
    exampleTranslation: 'Bu tamamen gizli bir bilgi.',
  },
  'свобода': {
    fact: 'Türkçe: "özgürlük". "Radio Svoboda" (Özgürlük Radyosu), Soğuk Savaş boyunca Demir Perde\'nin arkasına sansürsüz yayın yapan bir ABD destekli istasyondu.',
    example: 'Свобода слова — важное право человека.',
    exampleTranslation: 'İfade özgürlüğü önemli bir insan hakkıdır.',
    philosophy: "Isaiah Berlin'in \"negatif özgürlük\" (müdahaleden azade olma) ile \"pozitif özgürlük\" (kendi kaderini tayin) ayrımı, Sovyet \"özgürlük\" söyleminin neden Batılı anlamdan farklı işlediğini açıklar.",
  },
  'граница': {
    fact: 'Türkçe: "sınır". Demir Perde boyunca uzanan sınırlar, dünyanın en ağır korunan ve mayınlı bölgeleriydi.',
    example: 'Граница между странами была закрыта.',
    exampleTranslation: 'İki ülke arasındaki sınır kapatıldı.',
  },
  'ракета': {
    fact: 'Türkçe: "roket". Sovyet roket programı 1957\'de dünyanın ilk kıtalararası balistik füzesini (R-7) geliştirdi.',
    example: 'Ракета взлетела с космодрома.',
    exampleTranslation: 'Roket, uzay üssünden fırlatıldı.',
  },
  'революция': {
    fact: 'Türkçe: "devrim". 1917 Ekim Devrimi, Bolşevikleri iktidara taşıyarak SSCB\'nin kuruluşuna zemin hazırladı.',
    example: 'Революция изменила ход истории.',
    exampleTranslation: 'Devrim, tarihin akışını değiştirdi.',
    philosophy: "Marx'ın tarihsel materyalizmi, devrimi bireysel iradenin değil üretim ilişkilerindeki çelişkilerin kaçınılmaz sonucu olarak görür — Hegel'in diyalektiğinin tarihe uygulanmış hali.",
  },
  'партия': {
    fact: 'Türkçe: "parti". Sovyetler Birliği Komünist Partisi (KPSS), ülkenin tek yasal siyasi partisiydi ve devletin tüm kademelerini kontrol ederdi.',
    example: 'Он вступил в коммунистическую партию.',
    exampleTranslation: 'Komünist partiye katıldı.',
    philosophy: "Lenin'in \"öncü parti\" (avangard) teorisi, Rousseau'nun \"genel irade\" kavramını bir kitle yerine disiplinli bir kadronun temsil edebileceğini öne sürerek dönüştürür.",
  },
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianFact(term) {
  return RUSSIAN_ENTRIES[term.trim().toLowerCase()]?.fact ?? ''
}

/**
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null}
 */
export function getRussianExample(term) {
  const entry = RUSSIAN_ENTRIES[term.trim().toLowerCase()]
  return entry ? { sentence: entry.example, translation: entry.exampleTranslation } : null
}

/**
 * @param {string} term
 * @returns {string}
 */
export function getRussianPhilosophy(term) {
  return RUSSIAN_ENTRIES[term.trim().toLowerCase()]?.philosophy ?? ''
}
