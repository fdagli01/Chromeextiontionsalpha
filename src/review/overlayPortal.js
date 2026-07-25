/**
 * Portal target for the review screen's modal overlays.
 *
 * They cannot render in place: ReviewScreen's wrapper sets `perspective`,
 * which creates a stacking context their z-index cannot escape, so the
 * daily briefing would paint over them. They also cannot go to
 * `document.body`, because every theme colour is a CSS custom property
 * scoped to `.theme-root` — outside it, `var(--color-surface-strong)`
 * resolves to nothing and the overlay renders fully transparent.
 *
 * `.theme-root` is the one element that is both outside the perspective
 * context and inside the variable scope.
 * @returns {HTMLElement}
 */
export function getOverlayPortalTarget() {
  return document.querySelector('.theme-root') ?? document.body
}
