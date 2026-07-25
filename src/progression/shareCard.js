/**
 * Builds a plain-text, box-framed "report card" from a set of stat lines,
 * suitable for copying to the clipboard and pasting into a chat or social
 * post. Kept dependency-free and pure so it's trivially unit-testable and
 * works entirely offline (the extension has no backend).
 */

/**
 * @param {Object} opts
 * @param {string} opts.title - header line, e.g. "K.G.B. TERMINAL"
 * @param {string} [opts.subtitle] - optional second header line
 * @param {Array<[string, string|number]>} opts.rows - label/value pairs
 * @param {string} [opts.footer] - optional closing line
 * @returns {string}
 */
export function buildShareCard({ title, subtitle, rows, footer }) {
  const lines = []
  lines.push(title)
  if (subtitle) lines.push(subtitle)
  lines.push('')
  const labelWidth = Math.max(...rows.map(([label]) => label.length))
  for (const [label, value] of rows) {
    lines.push(`${label.padEnd(labelWidth)}  ${value}`)
  }
  if (footer) {
    lines.push('')
    lines.push(footer)
  }

  const width = Math.max(...lines.map((l) => l.length))
  const top = `╔${'═'.repeat(width + 2)}╗`
  const bottom = `╚${'═'.repeat(width + 2)}╝`
  const body = lines.map((l) => `║ ${l.padEnd(width)} ║`)
  return [top, ...body, bottom].join('\n')
}

/**
 * Copies text to the clipboard, resolving to whether it succeeded. Falls back
 * to a hidden textarea + execCommand for environments where the async
 * Clipboard API is unavailable or blocked.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}
