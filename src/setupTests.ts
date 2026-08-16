// Adds the jest-dom matchers (toBeInTheDocument, toHaveTextContent, ...) to Vitest's expect.
import '@testing-library/jest-dom/vitest'

/**
 * jsdom implements no media queries at all, and several screens ask whether the
 * device is touch-first before deciding what a button should say. Answering "no
 * match" is the desktop answer, which is what this environment is; a test that
 * needs the touch branch has to say so itself.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })
}

/**
 * `index.html` carries a second root that modals are portalled into. jsdom starts
 * from an empty document, and `ModalContainer` reads the element once at mount -
 * so without this a test that opens a modal fails on a null portal target.
 */
beforeEach(() => {
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div')

    modalRoot.id = 'modal-root'
    document.body.appendChild(modalRoot)
  }
})
