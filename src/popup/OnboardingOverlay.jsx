import './OnboardingOverlay.css'

const STEPS = [
  {
    icon: '🖱',
    title: 'CAPTURE',
    body: 'Select any word on a webpage, right-click, and file it under the era you\'re studying. Translation and any historical trivia attach automatically.',
  },
  {
    icon: '⚑',
    title: 'REVIEW',
    body: 'Flip cards in INTERROGATE and answer honestly — a spaced-repetition scheduler (FSRS) decides when each word comes back, sooner if you missed it, later if you nailed it.',
  },
  {
    icon: '🎖',
    title: 'PROGRESS',
    body: 'Correct answers earn XP and streaks. Leveling up unlocks FACTIONS and CRISES — this app opens up as you go, so a locked tab just means "not yet".',
  },
  {
    icon: '🔍',
    title: 'EXPLORE',
    body: 'A few words hide one-time secret anecdotes, and rare moments (a "double agent" choice, a cold case, a promotion) show up on their own. Nothing here is fully explained up front on purpose.',
  },
]

/**
 * A one-time, four-step "how this works" card shown on first launch only —
 * this app front-loads a lot of systems (factions, crises, secrets, tension)
 * that a first-time user has no way to discover from the empty review
 * screen alone. Theme-neutral (uses the current theme's CSS vars but no
 * theme-specific copy) since it needs to make sense on whichever of the
 * five themes the user happens to land on first.
 * @param {{onDismiss: () => void}} props
 */
export function OnboardingOverlay({ onDismiss }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-label">WELCOME — HOW THIS WORKS</div>
        <div className="onboarding-steps">
          {STEPS.map((step) => (
            <div className="onboarding-step" key={step.title}>
              <span className="onboarding-step-icon">{step.icon}</span>
              <div>
                <div className="onboarding-step-title">{step.title}</div>
                <p className="onboarding-step-body">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="onboarding-dismiss" onClick={onDismiss}>
          GOT IT →
        </button>
      </div>
    </div>
  )
}
