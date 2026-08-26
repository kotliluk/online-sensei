import { vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { ShareButton } from '../ShareButton'
import { store } from '../../../../redux/store'
import { selectTranslation } from '../../../../redux/page/selector'


const renderButton = (): void => {
  render(
    <ReduxProvider store={store}>
      <ShareButton buildUrl={() => 'https://example.test/online-sensei/'} />
    </ReduxProvider>,
  )
}

const press = (): void => {
  act(() => {
    screen.getByRole('button').click()
  })
}

const message = (): string | null => screen.queryByRole('status')?.textContent ?? null

/** The wording is the point - "it failed" and "it copied" must not be interchangeable. */
const t = (): { shareCopied: string, shareFailed: string } => selectTranslation(store.getState()).common

const setClipboard = (value: unknown): (() => void) => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })

  return () => {
    if (original) {
      Object.defineProperty(navigator, 'clipboard', original)
    } else {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  }
}

const withClipboard = (value: unknown, run: () => void): void => {
  const restore = setClipboard(value)
  try {
    run()
  } finally {
    restore()
  }
}

describe('ShareButton', () => {
  test('says it copied when the clipboard took the link', async () => {
    // arrange
    const restore = setClipboard({ writeText: () => Promise.resolve() })
    try {
      renderButton()
      // act
      press()
      await act(() => Promise.resolve())
      // assert
      expect(message()).toBe(t().shareCopied)
    } finally {
      restore()
    }
  })

  /**
   * `navigator.clipboard` is marked `[SecureContext]`, so over plain http the property is
   * not merely unusable - it is absent. Reaching through it throws where it stands, before
   * any promise exists, so a `.catch` never sees it. The app is opened over http from the
   * local network all the time, which is what `yarn dev:https` exists for.
   */
  test('says it failed where there is no clipboard at all', () => {
    // arrange
    withClipboard(undefined, () => {
      renderButton()
      // act
      press()
      // assert - the alternative is a button that looks broken
      expect(message()).toBe(t().shareFailed)
    })
  })

  test('does not throw where there is no clipboard at all', () => {
    // arrange
    withClipboard(undefined, () => {
      renderButton()
      // act + assert
      expect(() => press()).not.toThrow()
    })
  })
  /**
   * The other way it fails, and the more likely one: the clipboard is there, the call is
   * made, and the promise comes back rejected - a denied permission prompt, or Safari
   * deciding the click was too long ago to count as a gesture. Nothing throws, so only the
   * `.catch` stands between that and a button which says it copied a link it never copied.
   */
  test('says it failed when the clipboard turns the link down', async () => {
    // arrange
    const restore = setClipboard({ writeText: () => Promise.reject(new Error('NotAllowedError')) })
    try {
      renderButton()
      // act
      press()
      await act(() => Promise.resolve())
      // assert
      expect(message()).toBe(t().shareFailed)
    } finally {
      restore()
    }
  })
  /**
   * The message has to go away on its own. It talks about "the current set up", and the
   * user carries on editing the moment they have the link - a message that stays put ends
   * up describing a form that has moved on since.
   *
   * Not covered here: the same timeout being cleared when the button unmounts. Anything
   * that could assert it in jsdom would be a spy on `clearTimeout` asserting that the code
   * calls `clearTimeout`, which is worth nothing.
   */
  test('takes the message away again after a while', async () => {
    // arrange
    vi.useFakeTimers()
    const restore = setClipboard({ writeText: () => Promise.resolve() })
    try {
      renderButton()
      press()
      await act(() => Promise.resolve())
      expect(message()).toBe(t().shareCopied)
      // act
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      // assert
      expect(message()).toBeNull()
    } finally {
      restore()
      vi.useRealTimers()
    }
  })
})
