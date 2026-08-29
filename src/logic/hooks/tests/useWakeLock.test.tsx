import { act, render } from '@testing-library/react'
import { JSX } from 'react'
import { useWakeLock } from '../useWakeLock'


/**
 * jsdom has no wake lock, so the whole API is stood in for. `released` is the property that
 * matters: it is how a lock the page still holds is told apart from one the browser took
 * back while the document was hidden, which is what happens every time a phone screen
 * goes off.
 */
class FakeSentinel {
  released = false

  release (): Promise<void> {
    this.released = true

    return Promise.resolve()
  }

  /** What the browser does on its own when the document is hidden. */
  dropped (): void {
    this.released = true
  }
}

let asked: string[] = []
let handed: FakeSentinel[] = []
let refuse = false
/** A browser that has taken the question and not answered it yet. */
let stall = false

const installWakeLock = (): void => {
  const wakeLock = {
    request: (type: string): Promise<FakeSentinel> => {
      asked.push(type)

      if (stall) {
        return new Promise<FakeSentinel>(() => {})
      }

      if (refuse) {
        return Promise.reject(new Error('the battery is too low'))
      }

      const sentinel = new FakeSentinel()
      handed.push(sentinel)

      return Promise.resolve(sentinel)
    },
  }

  Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true })
}

const setVisibility = (state: 'visible' | 'hidden'): void => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
}

/** Both the state and the event, because the hook listens for one and reads the other. */
const goVisible = async (state: 'visible' | 'hidden'): Promise<void> => {
  setVisibility(state)
  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
    await Promise.resolve()
  })
}

/** The request is a promise, so mounting is not enough - the microtasks have to run. */
const settle = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

const Probe = ({ enabled }: { enabled?: boolean }): JSX.Element => {
  useWakeLock(enabled)

  return <span>probe</span>
}

describe('useWakeLock', () => {
  beforeEach(() => {
    asked = []
    handed = []
    refuse = false
    stall = false
    setVisibility('visible')
    installWakeLock()
  })

  afterEach(() => {
    delete (navigator as { wakeLock?: unknown }).wakeLock
  })

  test('asks for a screen lock while the screen is mounted', async () => {
    // arrange + act
    render(<Probe />)
    await settle()
    // assert
    expect(asked).toEqual(['screen'])
  })

  test('gives the lock back when the screen goes away', async () => {
    // arrange
    const { unmount } = render(<Probe />)
    await settle()
    // act
    unmount()
    await settle()
    // assert
    expect(handed[0].released).toBe(true)
  })

  /** iOS before 16.4 has no wake lock at all, and neither has anything over plain http. */
  test('does nothing at all when the browser has no wake lock', async () => {
    // arrange
    delete (navigator as { wakeLock?: unknown }).wakeLock
    // act
    render(<Probe />)
    await settle()
    // assert - the point is that the render above did not throw
    expect(asked).toEqual([])
  })

  /** A low battery is enough for a browser to say no, and that is not an error to show. */
  test('carries on when the browser refuses', async () => {
    // arrange
    refuse = true
    // act
    render(<Probe />)
    await settle()
    // assert
    expect(asked).toEqual(['screen'])
    expect(handed).toEqual([])
  })

  /**
   * The browser takes the lock back whenever the document is hidden and does not hand it
   * back on the way in. Without asking again, the lock would hold until the first time the
   * referee looked at anything else, and then quietly stop working.
   */
  test('asks again after the browser took the lock back', async () => {
    // arrange
    render(<Probe />)
    await settle()
    handed[0].dropped()
    // act - away and back
    await goVisible('hidden')
    await goVisible('visible')
    await settle()
    // assert
    expect(asked).toEqual(['screen', 'screen'])
  })

  test('does not ask again while it still holds one', async () => {
    // arrange
    render(<Probe />)
    await settle()
    // act - a visibility change that did not cost the lock
    await goVisible('visible')
    await settle()
    // assert
    expect(asked).toEqual(['screen'])
  })

  test('does not ask for a lock the hidden page could not be given', async () => {
    // arrange
    setVisibility('hidden')
    // act
    render(<Probe />)
    await settle()
    // assert
    expect(asked).toEqual([])
  })

  /**
   * Flicking through the app switcher can put the page back in view before the browser has
   * answered the first request. Asking again would leave the answer to the first one held
   * by nobody - a wake lock the page can no longer release, kept until the tab is closed.
   */
  test('does not ask twice while the first request is still on its way', async () => {
    // arrange - a browser that has taken the question and not answered it
    stall = true
    render(<Probe />)
    // act - back into view before the answer arrives
    await goVisible('visible')
    // assert
    expect(asked).toEqual(['screen'])
  })

  test('does not ask when it is turned off', async () => {
    // arrange + act
    render(<Probe enabled={false} />)
    await settle()
    // assert
    expect(asked).toEqual([])
  })
})
