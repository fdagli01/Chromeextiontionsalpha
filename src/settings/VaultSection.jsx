import { useEffect, useState } from 'react'
import { FRAGMENTS_PER_ARTIFACT, getVaultForTheme } from '../progression/artifacts.js'
import './VaultSection.css'

/**
 * The Vault: a per-theme grid of the two collectible artifacts, each built
 * from three fragments earned as proof of specific play (see
 * progression/artifacts.js — redemptions, streak tiers, bounty chains,
 * never random). An incomplete artifact shows as a dark silhouette with a
 * fragment-count pip row; completing it reveals the generated art and the
 * historical fact it was hiding.
 * @param {{themeId: string}} props
 */
export function VaultSection({ themeId }) {
  const [vault, setVault] = useState(null)

  useEffect(() => {
    let cancelled = false
    setVault(null)
    getVaultForTheme(themeId).then((v) => {
      if (!cancelled) setVault(v)
    })
    return () => {
      cancelled = true
    }
  }, [themeId])

  if (!vault) return null

  return (
    <div className="settings-vault">
      <span className="title">Vault</span>
      <span className="hint">
        Fragments are earned, never random — rescuing a struggling word, reaching a new streak
        tier, or chaining field bounties each mint the next piece.
      </span>
      <div className="vault-grid">
        {vault.map((artifact) => (
          <div key={artifact.id} className={`vault-card ${artifact.complete ? 'complete' : ''}`}>
            {artifact.complete ? (
              <img className="vault-art" src={artifact.image} alt={artifact.name} />
            ) : (
              <div className="vault-silhouette" aria-hidden="true">
                <span className="vault-silhouette-icon">{artifact.icon}</span>
              </div>
            )}
            <span className="vault-name">{artifact.name}</span>
            <div className="vault-pips">
              {Array.from({ length: FRAGMENTS_PER_ARTIFACT }).map((_, i) => (
                <span key={i} className={`vault-pip ${i < artifact.fragments ? 'filled' : ''}`} />
              ))}
            </div>
            {artifact.complete && <p className="vault-fact">{artifact.fact}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
