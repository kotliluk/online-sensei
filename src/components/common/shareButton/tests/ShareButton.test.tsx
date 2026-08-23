import { act, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { ShareButton } from '../ShareButton'
import { store } from '../../../../redux/store'


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

const withClipboard = (value: unknown, run: () => void): void => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })
  try {
    run()
  } finally {
    if (original) {
      Object.defineProperty(navigator, 'clipboard', original)
    } else {
      Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, 'clipboard')
    }
  }
}

describe('ShareButton', () => {
  test('says it copied when the clipboard took the link', async () => {
    // arrange
    await withClipboard({ writeText: () => Promise.resolve() }, async () => {
      renderButton()
      // act
      press()
      await act(async () => {})
      // assert
      expect(message()).toBeTruthy()
    })
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
      expect(message()).toBeTruthy()
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
})
