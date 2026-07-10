const MAX_RETRIES = 3
const BASE_DELAY_MS = 2000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Reads Gemini's suggested retry delay (e.g. "13s") out of a 429 error
 * body, if present.
 * @param {any} errorBody
 * @returns {number | null} milliseconds, or null if not present/parseable
 */
function retryDelayFromErrorBody(errorBody) {
  const detail = errorBody?.error?.details?.find((d) => typeof d?.retryDelay === 'string')
  const match = detail && /^(\d+(?:\.\d+)?)s$/.exec(detail.retryDelay)
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null
}

/**
 * POSTs to a Gemini `generateContent` endpoint, retrying on 429
 * (TooManyRequests) with the server-suggested delay or exponential
 * backoff, up to MAX_RETRIES times. Any other non-ok status, or a thrown
 * network error, resolves to null immediately (no retry).
 * @param {string} endpoint
 * @param {string} body - JSON-stringified request body
 * @returns {Promise<any | null>} the parsed response body, or null on failure
 */
export async function requestGemini(endpoint, body) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
    } catch (error) {
      console.warn('Polyglot Chronicle: Gemini request failed', error)
      return null
    }

    if (response.ok) return response.json()

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const errorBody = await response.json().catch(() => null)
      const delay = retryDelayFromErrorBody(errorBody) ?? BASE_DELAY_MS * 2 ** attempt
      await sleep(delay)
      continue
    }

    return null
  }
  return null
}
