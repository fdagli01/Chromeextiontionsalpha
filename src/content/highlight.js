import { buildTermRegex } from './matcher.js'

/**
 * Page-highlighting content script: quietly underlines any word on the
 * current page that is due for review in the extension's archive, in the
 * owning theme's accent color — the "the words you're learning are out
 * here in the wild" moment that only a browser extension can deliver.
 *
 * All data comes from the background service worker over messaging (a
 * content script's IndexedDB belongs to the *page's* origin, not the
 * extension's, so it cannot read the archive directly). Deliberately
 * read-only and bounded: it never mutates page text beyond wrapping matches
 * in a <span>, caps its own work hard, and does nothing at all when the
 * user has toggled highlighting off in Mainframe settings.
 */

/** Hard caps so a pathological page (endless scroll, huge DOM) costs ~nothing. */
const MAX_TEXT_NODES_SCANNED = 4000
const MAX_HIGHLIGHTS = 120

/** Elements whose text must never be rewritten. */
const SKIPPED_PARENTS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  'CODE', 'PRE', 'KBD', 'SAMP', 'IFRAME', 'CANVAS', 'SVG',
])

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .polyglot-highlight {
      border-bottom: 2px solid var(--pg-color, #ffcc00);
      background: color-mix(in srgb, var(--pg-color, #ffcc00) 12%, transparent);
      border-radius: 2px;
      cursor: help;
      transition: background 0.15s;
    }
    .polyglot-highlight:hover {
      background: color-mix(in srgb, var(--pg-color, #ffcc00) 28%, transparent);
    }
  `
  document.documentElement.appendChild(style)
}

/**
 * @param {Text} textNode
 * @param {RegExp} regex
 * @param {Map<string, {translation: string, color: string}>} termInfo - keyed by lowercased term
 * @returns {number} highlights created from this node
 */
function highlightNode(textNode, regex, termInfo) {
  const text = textNode.nodeValue
  regex.lastIndex = 0
  let match = regex.exec(text)
  if (!match) return 0

  const fragment = document.createDocumentFragment()
  let cursor = 0
  let created = 0
  while (match) {
    const info = termInfo.get(match[0].toLowerCase())
    if (info) {
      if (match.index > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)))
      const span = document.createElement('span')
      span.className = 'polyglot-highlight'
      span.textContent = match[0]
      span.style.setProperty('--pg-color', info.color)
      span.title = info.translation
        ? `${match[0]} — ${info.translation} · due for review in Polyglot Chronicle`
        : `${match[0]} · due for review in Polyglot Chronicle`
      fragment.appendChild(span)
      cursor = match.index + match[0].length
      created++
    }
    match = regex.exec(text)
  }
  if (created === 0) return 0
  if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)))
  textNode.replaceWith(fragment)
  return created
}

async function run() {
  let response
  try {
    response = await chrome.runtime.sendMessage({ type: 'polyglot:getDueTerms' })
  } catch {
    return // extension reloading/unavailable — never break the page over it
  }
  if (!response?.enabled || !Array.isArray(response.terms) || response.terms.length === 0) return

  const termInfo = new Map(
    response.terms.map((t) => [t.term.toLowerCase(), { translation: t.translation, color: t.color }])
  )
  const regex = buildTermRegex(response.terms.map((t) => t.term))
  if (!regex) return

  injectStyles()

  // Collect first, mutate after — mutating mid-walk invalidates the walker.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || SKIPPED_PARENTS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      if (parent.closest('[contenteditable], .polyglot-highlight')) return NodeFilter.FILTER_REJECT
      if (node.nodeValue.trim().length < 3) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const nodes = []
  while (walker.nextNode() && nodes.length < MAX_TEXT_NODES_SCANNED) {
    nodes.push(walker.currentNode)
  }

  let total = 0
  for (const node of nodes) {
    total += highlightNode(node, regex, termInfo)
    if (total >= MAX_HIGHLIGHTS) break
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run, { once: true })
} else {
  run()
}
