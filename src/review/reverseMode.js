/**
 * "Reverse Interrogation" day: once a week, review flips direction — the
 * translation is shown and the player picks the source-language term,
 * instead of the usual term-to-translation recall. Same words, same SRS
 * data, but production instead of recognition, which is a meaningfully
 * different (and harder) memory retrieval than the routine direction.
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isReverseDay(now = new Date()) {
  return now.getDay() === 1 // Monday
}
