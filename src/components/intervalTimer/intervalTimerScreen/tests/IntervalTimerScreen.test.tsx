import { vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { IntervalTimerScreen } from '../IntervalTimerScreen'
import { store } from '../../../../redux/store'
import { setIntervalTimerSimple } from '../../../../redux/intervalTimer/actions'


const renderScreen = (): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/interval-timer']}>
        <IntervalTimerScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

/** Rounds, seconds of work, seconds of pause - the three fields of the simple set-up. */
const startSeries = (rounds: number, work: number, pause: number): void => {
  act(() => {
    store.dispatch(setIntervalTimerSimple(rounds, work, pause, false, 'NO_BEEP', 0))
  })
  renderScreen()
  act(() => {
    screen.getByRole('button', { name: /start/i }).click()
  })
}

/**
 * One second at a time, because that is how the screen gets them. Moving on to the next
 * interval is decided by an effect, and an effect only runs after a render - advancing
 * several seconds inside one `act` would flush once at the end and skip every transition.
 */
const wait = (seconds: number): void => {
  for (let i = 0; i < seconds; ++i) {
    act(() => {
      vi.advanceTimersByTime(1000)
    })
  }
}

const clock = (): string => document.querySelector('.time')?.textContent ?? ''

const headline = (): string => document.querySelector('p')?.textContent ?? ''

describe('IntervalTimerScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('counts a work interval down', () => {
    // arrange + act
    startSeries(1, 3, 1)
    wait(1)
    // assert
    expect(clock()).toBe('2')
  })

  test('moves on to the pause when the work interval runs out', () => {
    // arrange + act
    startSeries(1, 2, 3)
    wait(2)
    // assert
    expect(clock()).toBe('3')
  })

  test('says it is finished instead of crashing when the series runs out', () => {
    // arrange - one round, two seconds of work, one of pause
    startSeries(1, 2, 1)
    // act - run past the whole series
    wait(4)
    // assert
    expect(headline()).toMatch(/finished/i)
  })

  test('a pause of zero seconds does not stall the series', () => {
    // arrange - two rounds with no rest at all, which the set-up screen allows
    startSeries(2, 2, 0)
    // act
    wait(5)
    // assert - four intervals of which two are empty, so it is over
    expect(headline()).toMatch(/finished/i)
  })

  test('the clock never goes negative', () => {
    // arrange
    startSeries(2, 2, 0)
    // act
    wait(6)
    // assert
    expect(clock()).not.toMatch(/-/)
  })

  test('counts the rounds it was asked for', () => {
    // arrange
    startSeries(2, 2, 1)
    // act - through the first work interval and its pause
    wait(3)
    // assert
    expect(headline()).toMatch(/2\/2/)
  })
})
