import { vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { GroupStopwatchScreen } from '../GroupStopwatchScreen'
import { store } from '../../../../redux/store'
import { setGroupStopwatch } from '../../../../redux/groupStopwatch/actions'
import { newCompetitorSetup } from '../../../../types/groupStopwatch'
import { LONG_PRESS_MS } from '../../../../logic/hooks/useLongPress'


/**
 * The clock ticks every 45 ms and reports whole ticks, so the times used here are
 * multiples of 45 - otherwise the screen would show a number the test did not choose.
 */
const TICK = 45

const roster = ['Aneta', 'Bob', 'Cyril'].map((name) => newCompetitorSetup(name))

const renderScreen = (): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/group-stopwatch']}>
        <GroupStopwatchScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const wait = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/** Cards are labelled with the starting number as well, which differs per competitor. */
const card = (name: string): HTMLElement => {
  return screen.getByText(new RegExp(`^\\d+\\) ${name}$`)).closest('.competitor-card') as HTMLElement
}

const pressable = (name: string): HTMLElement => {
  return card(name).querySelector('.competitor-press') as HTMLElement
}

/** A tap: down and up in one go, the way a finger saves a time. */
const tap = (name: string): void => {
  const target = pressable(name)

  fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
  fireEvent.pointerUp(target)
}

/** A hold: down, wait it out, up - including the release that must not save anything. */
const hold = (name: string): void => {
  const target = pressable(name)

  fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
  wait(LONG_PRESS_MS)
  fireEvent.pointerUp(target)
}

const timeOf = (name: string): string => {
  return (card(name).querySelector('.competitor-time') as HTMLElement).textContent ?? ''
}

const clock = (): string => (document.querySelector('.time') as HTMLElement).textContent ?? ''

const press = (label: string): void => {
  fireEvent.click(screen.getByRole('button', { name: label }))
}

/**
 * A real tap on a correction button, pointer events and all.
 *
 * `fireEvent.click` alone would not do: it sends no pointer events, so it could not tell
 * a button that sits beside the pressed area of the card from one that sits inside it -
 * and inside, every correction would save a time on its way out.
 */
const tapButton = (name: string, label: string): void => {
  const button = within(card(name)).getByRole('button', { name: label })

  fireEvent.pointerDown(button, { clientX: 100, clientY: 100 })
  fireEvent.pointerUp(button)
  fireEvent.click(button)
}

/** Starts the clock and lets it run, so the times saved after this are not zero. */
const runFor = (ticks: number): void => {
  press('Start')
  wait(ticks * TICK)
}

describe('GroupStopwatchScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // the store is shared between tests, and the screen gives the session up on unmount
    store.dispatch(setGroupStopwatch(3, roster))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('counter of who has finished', () => {
    test('starts at nobody and counts every saved time', () => {
      // arrange
      renderScreen()
      // assert
      expect(screen.getByText('0 / 3')).toBeInTheDocument()
      // act
      tap('Aneta')
      // assert
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    test('counts back down when a time is thrown away', () => {
      // arrange
      renderScreen()
      tap('Aneta')
      // act
      hold('Aneta')
      // assert
      expect(screen.getByText('0 / 3')).toBeInTheDocument()
    })

    test('is back to nobody after a reset', () => {
      // arrange
      renderScreen()
      runFor(111)
      tap('Aneta')
      // act - reset is only reachable from a paused clock
      press('Pause')
      press('Reset')
      // assert
      expect(screen.getByText('0 / 3')).toBeInTheDocument()
      expect(timeOf('Aneta')).toBe('--.--')
    })
  })

  describe('correcting a saved time', () => {
    test('offers the buttons only once there is a time to move', () => {
      // arrange
      renderScreen()
      // assert
      expect(within(card('Aneta')).queryByRole('button', { name: '+1 s' })).not.toBeInTheDocument()
      // act
      tap('Aneta')
      // assert
      expect(within(card('Aneta')).getByRole('button', { name: '+1 s' })).toBeInTheDocument()
      expect(within(card('Aneta')).getByRole('button', { name: '−1 s' })).toBeInTheDocument()
    })

    test('moves that one time by a second and leaves everything else alone', () => {
      // arrange - two competitors in, because a correction that hit every card would look
      // exactly like a correct one as long as only one of them has a time
      renderScreen()
      runFor(277)
      tap('Aneta')
      expect(timeOf('Aneta')).toBe('12.46')
      wait(100 * TICK)
      tap('Bob')
      expect(timeOf('Bob')).toBe('16.96')
      // act
      tapButton('Aneta', '+1 s')
      // assert
      expect(timeOf('Aneta')).toBe('13.46')
      expect(timeOf('Bob')).toBe('16.96')
      expect(clock()).toBe('16.96')
    })

    test('takes a second off', () => {
      // arrange
      renderScreen()
      runFor(277)
      tap('Aneta')
      // act
      tapButton('Aneta', '−1 s')
      // assert
      expect(timeOf('Aneta')).toBe('11.46')
    })

    test('does not save the running time along the way', () => {
      // arrange - the correction happens well after the finish, and the buttons sit on a
      // card that saves a time when tapped
      renderScreen()
      runFor(277)
      tap('Aneta')
      wait(200 * TICK)
      // act
      tapButton('Aneta', '+1 s')
      // assert - the finish, moved by a second; not the clock as it is now
      expect(timeOf('Aneta')).toBe('13.46')
    })
  })

  describe('throwing a time away', () => {
    test('a hold clears that card and the release does not save it again', () => {
      // arrange - again two of them, so clearing the wrong card as well would show
      renderScreen()
      runFor(277)
      tap('Aneta')
      wait(100 * TICK)
      tap('Bob')
      // act
      hold('Aneta')
      // assert
      expect(timeOf('Aneta')).toBe('--.--')
      expect(timeOf('Bob')).toBe('16.96')
      expect(within(card('Aneta')).queryByRole('button', { name: '+1 s' })).not.toBeInTheDocument()
    })

    test('a hold on a card without a time does nothing', () => {
      // arrange
      renderScreen()
      runFor(277)
      // act
      hold('Bob')
      // assert
      expect(timeOf('Bob')).toBe('--.--')
      expect(screen.getByText('0 / 3')).toBeInTheDocument()
    })
  })

  describe('what the screen already did', () => {
    test('a tap saves the time and a second one within two seconds rewrites it', () => {
      // arrange
      renderScreen()
      runFor(111)
      // act
      tap('Aneta')
      expect(timeOf('Aneta')).toBe('04.99')
      wait(20 * TICK)
      tap('Aneta')
      // assert
      expect(timeOf('Aneta')).toBe('05.89')
    })

    test('a tap much later leaves the saved time where it is', () => {
      // arrange
      renderScreen()
      runFor(111)
      // act
      tap('Aneta')
      wait(3000)
      tap('Aneta')
      // assert - the two second window has closed, so a stray tap costs nothing
      expect(timeOf('Aneta')).toBe('04.99')
    })
  })
})
