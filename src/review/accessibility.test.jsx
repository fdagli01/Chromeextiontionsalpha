import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActBriefingOverlay } from './ActBriefingOverlay.jsx'
import { ACTS } from '../progression/acts.js'

/**
 * The review loop is almost entirely visual — stamps, seals, coloured
 * panels, emoji glyphs. These tests pin the non-visual affordances that a
 * screen-reader user depends on, so a future restyle can't silently
 * remove them.
 */
vi.mock('../progression/acts.js', async (importOriginal) => ({
  ...(await importOriginal()),
  markActSeen: vi.fn(() => Promise.resolve()),
}))

describe('modal overlays', () => {
  it('announce themselves as modal dialogs with a meaningful name', () => {
    const act = ACTS.russian[0]
    render(<ActBriefingOverlay themeId="russian" act={act} onClose={() => {}} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName(act.title)
  })

  it('expose the act text and its dismiss control to assistive tech', () => {
    const act = ACTS.french[0]
    render(<ActBriefingOverlay themeId="french" act={act} onClose={() => {}} />)

    expect(screen.getByRole('heading', { name: act.title })).toBeInTheDocument()
    expect(screen.getByText(act.body)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /BEGIN/ })).toBeInTheDocument()
  })

  it('hides the purely decorative rule from the accessibility tree', () => {
    const act = ACTS.spanish[0]
    // The overlay is portaled out of its parent (see overlayPortal.js), so
    // it lives on document, not inside the render container.
    render(<ActBriefingOverlay themeId="spanish" act={act} onClose={() => {}} />)
    expect(document.querySelector('.act-rule')).toHaveAttribute('aria-hidden', 'true')
  })
})
