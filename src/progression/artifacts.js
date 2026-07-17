import { getArtifactRecordsForTheme, setArtifactFragments } from '../db/artifactsRepo.js'
import { saveProgress } from '../db/progressRepo.js'

import russianFialkaImg from '../assets/images/artifacts/russian-fialka.png'
import russianPravdaImg from '../assets/images/artifacts/russian-pravda.png'
import italianAquilaImg from '../assets/images/artifacts/italian-aquila.png'
import italianMosaicImg from '../assets/images/artifacts/italian-mosaic.png'
import portugueseAstrolabeImg from '../assets/images/artifacts/portuguese-astrolabe.png'
import portuguesePadraoImg from '../assets/images/artifacts/portuguese-padrao.png'
import frenchPrintblockImg from '../assets/images/artifacts/french-printblock.png'
import frenchCockadeImg from '../assets/images/artifacts/french-cockade.png'
import spanishTypecaseImg from '../assets/images/artifacts/spanish-typecase.png'
import spanishGuernicaImg from '../assets/images/artifacts/spanish-guernica.png'

/** Fragments needed to complete any artifact. */
export const FRAGMENTS_PER_ARTIFACT = 3

/**
 * @typedef {Object} ArtifactDef
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} image
 * @property {string} fact - revealed once the artifact is fully assembled
 */

/**
 * Two artifacts per theme, in a fixed reveal order — the first artifact's
 * three fragments are always minted before the second artifact's first
 * fragment, so the Vault fills predictably left to right.
 * @type {Record<string, ArtifactDef[]>}
 */
export const ARTIFACT_CATALOG = {
  russian: [
    {
      id: 'fialka',
      name: "Fialka M-125 Cipher Disk",
      icon: '🔐',
      image: russianFialkaImg,
      fact: "The USSR's own Enigma-successor cipher machine stayed partly classified until the 2000s — NATO cryptanalysts studied captured units for decades trying to fully map its rotor wiring.",
    },
    {
      id: 'pravda',
      name: 'Censored Pravda Page',
      icon: '📰',
      image: russianPravdaImg,
      fact: 'Soviet photo-retouchers routinely airbrushed purged officials out of published photographs — the same skill was occasionally applied to entire newspaper columns when a story fell out of favor overnight.',
    },
  ],
  italian: [
    {
      id: 'aquila',
      name: 'Legion Aquila Standard',
      icon: '🦅',
      image: italianAquilaImg,
      fact: "Losing a legion's aquila to an enemy was such a disgrace that Rome would sometimes disband the legion entirely rather than let it fight on without one.",
    },
    {
      id: 'mosaic',
      name: 'Forum Lion Mosaic',
      icon: '🦁',
      image: italianMosaicImg,
      fact: "Roman floor mosaics doubled as quiet propaganda — a wealthy owner's mosaic might depict conquered beasts or distant trade goods, a subtle brag laid underfoot for every guest to walk across.",
    },
  ],
  portuguese: [
    {
      id: 'astrolabe',
      name: "Mariner's Astrolabe",
      icon: '⚙',
      image: portugueseAstrolabeImg,
      fact: 'In 2014, marine archaeologists recovered a bronze disc from a Portuguese shipwreck off Oman, sunk in 1503 — later confirmed as the oldest known mariner\'s astrolabe.',
    },
    {
      id: 'padrao',
      name: 'Padrão Stone Marker',
      icon: '🗿',
      image: portuguesePadraoImg,
      fact: 'Diogo Cão planted stone padrões bearing the Portuguese royal arms on every newly charted coastline — several still stand today on the Namibian and Angolan coasts, five centuries later.',
    },
  ],
  french: [
    {
      id: 'printblock',
      name: 'Revolutionary Print Block',
      icon: '🖨',
      image: frenchPrintblockImg,
      fact: 'Paris print shops could turn a pamphlet from manuscript to thousands of printed copies overnight — the sheer speed of the revolutionary press is part of why events felt unstoppable to people living through them.',
    },
    {
      id: 'cockade',
      name: 'Tricolor Cockade',
      icon: '🎗',
      image: frenchCockadeImg,
      fact: 'By 1793 the color of your cockade was a life-or-death fashion statement — wearing the wrong ribbon in the wrong crowd could get you denounced on the spot.',
    },
  ],
  spanish: [
    {
      id: 'typecase',
      name: "Compositor's Type Case",
      icon: '🔤',
      image: spanishTypecaseImg,
      fact: 'Militia units on the front sometimes ran their own trench newspapers, hand-set and printed just a few meters behind the line.',
    },
    {
      id: 'guernica',
      name: 'Guernica Charcoal Study',
      icon: '🎨',
      image: spanishGuernicaImg,
      fact: "Picasso's dated preparatory sketches show the Guernica mural evolving almost daily — the final composition changed dramatically in under five weeks.",
    },
  ],
}

/**
 * Merges the catalog with saved fragment counts for a theme's Vault display.
 * @param {string} themeId
 * @returns {Promise<Array<ArtifactDef & {fragments: number, complete: boolean}>>}
 */
export async function getVaultForTheme(themeId) {
  const catalog = ARTIFACT_CATALOG[themeId] ?? []
  const records = await getArtifactRecordsForTheme(themeId)
  const fragmentsById = Object.fromEntries(records.map((r) => [r.artifactId, r.fragments]))
  return catalog.map((artifact) => {
    const fragments = fragmentsById[artifact.id] ?? 0
    return { ...artifact, fragments, complete: fragments >= FRAGMENTS_PER_ARTIFACT }
  })
}

/**
 * Mints the next fragment in this theme's fixed reveal order — the first
 * artifact with fragments < 3, or a no-op if every artifact for the theme
 * is already complete. Never random: every mint is a direct consequence of
 * one of the three trigger events in recordRedemption / recordStreakTier /
 * recordBountyCompletion, so the player can always explain why they got it.
 * @param {string} themeId
 * @returns {Promise<{artifact: ArtifactDef, fragments: number, justCompleted: boolean} | null>}
 */
export async function mintNextFragment(themeId) {
  const catalog = ARTIFACT_CATALOG[themeId] ?? []
  const records = await getArtifactRecordsForTheme(themeId)
  const fragmentsById = Object.fromEntries(records.map((r) => [r.artifactId, r.fragments]))

  const target = catalog.find((artifact) => (fragmentsById[artifact.id] ?? 0) < FRAGMENTS_PER_ARTIFACT)
  if (!target) return null

  const nextFragments = (fragmentsById[target.id] ?? 0) + 1
  await setArtifactFragments(themeId, target.id, nextFragments)
  return { artifact: target, fragments: nextFragments, justCompleted: nextFragments >= FRAGMENTS_PER_ARTIFACT }
}

/** Redemptions needed (a struggling word recalled correctly) to mint a fragment. */
const REDEMPTIONS_PER_FRAGMENT = 3

/**
 * Call when a word that was `struggling` gets recalled correctly. Every 3rd
 * distinct redemption mints the next Vault fragment.
 * @param {string} themeId
 * @param {import('../db/progressRepo.js').ThemeProgress} progress - progress read before this review's own save
 * @returns {Promise<{artifact: ArtifactDef, fragments: number, justCompleted: boolean} | null>}
 */
export async function recordRedemption(themeId, progress) {
  const nextCount = progress.redemptionCount + 1
  await saveProgress(themeId, { redemptionCount: nextCount })
  if (nextCount % REDEMPTIONS_PER_FRAGMENT !== 0) return null
  return mintNextFragment(themeId)
}

/**
 * Call whenever xpService detects a new streak tier reached. Each new tier
 * mints a fragment directly — tiers are already infrequent, so no extra
 * counting is needed.
 * @param {string} themeId
 * @returns {Promise<{artifact: ArtifactDef, fragments: number, justCompleted: boolean} | null>}
 */
export async function recordStreakTierReached(themeId) {
  return mintNextFragment(themeId)
}

/** Completed bounties needed to mint a fragment. */
const BOUNTIES_PER_FRAGMENT = 3

/**
 * Call whenever a daily field bounty completes. Every 3rd completed bounty
 * mints the next Vault fragment.
 * @param {string} themeId
 * @param {import('../db/progressRepo.js').ThemeProgress} progress
 * @returns {Promise<{artifact: ArtifactDef, fragments: number, justCompleted: boolean} | null>}
 */
export async function recordBountyCompletion(themeId, progress) {
  const nextCount = progress.bountyCompletionCount + 1
  await saveProgress(themeId, { bountyCompletionCount: nextCount })
  if (nextCount % BOUNTIES_PER_FRAGMENT !== 0) return null
  return mintNextFragment(themeId)
}
