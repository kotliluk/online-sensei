import { vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { KumiteTimerScreen } from '../KumiteTimerScreen'
import { store } from '../../../../redux/store'
import { setKumiteTimer } from '../../../../redux/kumiteTimer/actions'


const { signals } = vi.hoisted(() => ({ signals: [] as string[] }))

vi.mock('../../../../logic/audio/kumite', () => ({
  preloadKumiteAudio: (): void => {},
  playSignalEnd: (): void => { signals.push('END') },
  playAtoshibaraku: (): void => { signals.push('ATOSHIBARAKU') },
}))

const renderScreen = (seconds: number): void => {
  // a standalone fight - `setTournamentFight` would put the tournament duration back
  store.dispatch(setKumiteTimer(seconds))
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer']}>
        <KumiteTimerScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const press = (name: RegExp): void => {
  act(() => {
    screen.getByRole('button', { name }).click()
  })
}

/** The `+` and `-` beside the clock, which set the time by hand. */
const timeButton = (label: string): HTMLElement => {
  const buttons = [...document.querySelectorAll('.__fight-stats__time-btns button')]
  return buttons.find((b) => b.textContent === label) as HTMLElement
}

const setTimeByHand = (label: string, times: number): void => {
  for (let i = 0; i < times; ++i) {
    act(() => {
      timeButton(label).click()
    })
  }
}

const tick = (seconds: number): void => {
  for (let i = 0; i < seconds; ++i) {
    act(() => {
      vi.advanceTimersByTime(1000)
    })
  }
}

/**
 * Winding the clock back after the end is a real thing to do at a table - the referee
 * gives back a few seconds. What must not happen is the horn treating that as the fight
 * ending all over again.
 */
describe('KumiteTimerScreen - signals belong to the clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    signals.length = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('the horn sounds when the clock runs out', () => {
    // arrange
    renderScreen(2)
    press(/start/i)
    // act
    tick(2)
    // assert
    expect(signals).toEqual(['END'])
  })

  test('atoshibaraku sounds when the clock reaches fifteen seconds', () => {
    // arrange
    renderScreen(17)
    press(/start/i)
    // act
    tick(2)
    // assert
    expect(signals).toEqual(['ATOSHIBARAKU'])
  })

  test('setting the time by hand does not sound anything', () => {
    // arrange - the clock is stopped at twenty seconds
    renderScreen(20)
    // act - wind it down onto fifteen by hand
    setTimeByHand('-', 5)
    // assert
    expect(signals).toEqual([])
  })

  test('giving time back after the end and taking it away again does not sound twice', () => {
    // arrange - the fight has ended
    renderScreen(1)
    press(/start/i)
    tick(1)
    // act - a second given back, then taken away
    setTimeByHand('+', 1)
    setTimeByHand('-', 1)
    // assert
    expect(signals).toEqual(['END'])
  })

  test('the log records the end once, however the clock is nudged afterwards', () => {
    // arrange
    renderScreen(1)
    press(/start/i)
    tick(1)
    // act
    setTimeByHand('+', 1)
    setTimeByHand('-', 1)
    // assert
    press(/^Fight log/)
    const ends = screen.queryAllByRole('listitem').filter((li) => /end/i.test(li.textContent ?? ''))
    expect(ends).toHaveLength(1)
  })
})

