import { vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ReactionsScreen } from '../ReactionsScreen'
import { store } from '../../../../redux/store'
import { setReactions } from '../../../../redux/reactions/actions'


/** Three rounds, a signal of 200 ms, and a wait of exactly one second between them. */
const startExercise = (): void => {
  act(() => {
    store.dispatch(setReactions(3, 200, 1000, 1000, 2, ['#ff0000', '#00ff00'], 'NO_BEEP', 0))
  })
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/reactions']}>
        <ReactionsScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
  act(() => {
    screen.getByRole('button', { name: /start/i }).click()
  })
}

/**
 * In small steps, because each phase schedules the next one from an effect and an effect
 * only runs after a render. Advancing a whole round inside one `act` would fire the first
 * timeout and flush once at the end, so the chain would never get going.
 */
const wait = (ms: number): void => {
  for (let left = ms; left > 0; left -= 100) {
    act(() => {
      vi.advanceTimersByTime(Math.min(100, left))
    })
  }
}

const click = (name: RegExp): void => {
  act(() => {
    screen.getByRole('button', { name }).click()
  })
}

const headline = (): string => document.querySelector('p')?.textContent ?? ''

const litSignals = (): number => {
  return [...document.querySelectorAll('.signal-box')]
    .filter((b) => (b as HTMLElement).style.backgroundColor !== '').length
}

describe('ReactionsScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('lights a signal up once the wait is over', () => {
    // arrange + act
    startExercise()
    wait(1000)
    // assert
    expect(litSignals()).toBe(1)
  })

  test('works through the rounds it was given', () => {
    // arrange + act - each round is a second of waiting and 200 ms of signal
    startExercise()
    wait(1200)
    wait(1200)
    wait(1200)
    // assert
    expect(headline()).toMatch(/finished/i)
  })

  test('a reset during the first wait starts the exercise over instead of freezing it', () => {
    // arrange - pausing before the first signal leaves the phase where it already was,
    // so a reset that only sets that same phase changes nothing and nothing restarts
    startExercise()
    wait(400)
    click(/pause/i)
    // act
    click(/reset/i)
    wait(1000)
    // assert
    expect(litSignals()).toBe(1)
  })

  test('a reset during the first wait restarts the whole chain, not just one signal', () => {
    // arrange
    startExercise()
    wait(400)
    click(/pause/i)
    // act - reset, then let all three rounds run
    click(/reset/i)
    wait(1200)
    wait(1200)
    wait(1200)
    // assert
    expect(headline()).toMatch(/finished/i)
  })

  test('a reset after a signal has been seen also starts over', () => {
    // arrange - this one always worked, because the phase really does change
    startExercise()
    wait(1200)
    click(/pause/i)
    // act
    click(/reset/i)
    wait(1000)
    // assert
    expect(headline()).toMatch(/1\/3/)
  })
})
