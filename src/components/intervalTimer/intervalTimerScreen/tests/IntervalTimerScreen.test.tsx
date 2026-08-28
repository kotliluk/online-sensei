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

/**
 * How far the wall clock has run ahead of the timers that have not been let through yet.
 * Fake timers move `Date.now()` and the timer queue as one thing, so the gap a phone with
 * the screen off opens between them has to be made by hand.
 */
let skew = 0

/**
 * The device sleeps and wakes up: the seconds pass with nothing running, and the next timer
 * the browser gets round to has to account for them. That timer is a second late in fake
 * time as well, so the interval loses `seconds + 1`.
 */
const sleepThrough = (seconds: number): void => {
  skew += seconds * 1000
  act(() => {
    vi.advanceTimersByTime(1000)
  })
}

const clock = (): string => document.querySelector('.time')?.textContent ?? ''

const headline = (): string => document.querySelector('p')?.textContent ?? ''

describe('IntervalTimerScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    skew = 0
    const faked = Date.now.bind(Date)
    vi.spyOn(Date, 'now').mockImplementation(() => faked() + skew)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  /**
   * The training does not stop because the phone did, so the seconds that went by with the
   * timers frozen come off the interval that was running. What is deliberately not done is
   * carrying the leftover into the intervals after it: catching up a whole series means a
   * burst of beeps for boundaries nobody was there for, and a different shape of state -
   * see the assumptions in ticket 011.
   */
  test('catches up the seconds slept through inside the interval', () => {
    // arrange - ten seconds of work
    startSeries(1, 10, 5)
    // act - four seconds with nothing running
    sleepThrough(4)
    // assert - five of the ten are gone
    expect(clock()).toBe('5')
  })

  test('stops at the end of the interval rather than running the countdown past it', () => {
    // arrange - three seconds of work, then five of rest
    startSeries(1, 3, 5)
    // act - a minute with nothing running, far past the end of the work interval
    sleepThrough(60)
    // assert - the rest starts whole, and the leftover is dropped rather than carried
    expect(clock()).toBe('5')
  })
})
