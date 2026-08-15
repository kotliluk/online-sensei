import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { KumiteTimerScreen } from '../KumiteTimerScreen'
import App from '../../../../App'
import { store } from '../../../../redux/store'
import {
  setKumiteTimer,
  setKumiteTimerTournament,
  setNotActualKumiteTimer,
  setTournamentFight,
} from '../../../../redux/kumiteTimer/actions'
import { Fight, newCompetitor, newFight } from '../../../../types/tournament'
import { FightLogEntry } from '../../../../types/fightLog'


/**
 * Only the last step out to the browser is replaced - `willShareFile` stays real,
 * so the label is still decided by asking the environment. `exportFile` itself
 * reaches for `URL.createObjectURL`, which jsdom does not have, and what is worth
 * checking here is the file the screen hands over, not the handing over.
 */
const { exported } = vi.hoisted(() => ({ exported: [] as File[] }))

vi.mock('../../../../logic/download/exportFile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../logic/download/exportFile')>()),
  exportFile: (file: File): void => {
    exported.push(file)
  },
}))

/**
 * The screen preloads two audio files on mount and jsdom has no media stack -
 * `play()` there returns nothing to call `.catch` on. Stubbing it keeps the
 * mount from throwing; nothing here asserts on sound.
 */
beforeAll(() => {
  HTMLMediaElement.prototype.play = (): Promise<void> => Promise.resolve()
})

const renderScreen = (): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer']}>
        <KumiteTimerScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const startSession = (fight: Fight | null = null): void => {
  // setKumiteTimer clears the tournament fight, so the order matters
  store.dispatch(setKumiteTimer(120))
  store.dispatch(setTournamentFight(fight))
}

const scoreButton = (corner: 'red' | 'blue', label: string): HTMLElement => {
  const score = document.querySelector(`.__score.__${corner}`) as HTMLElement

  return Array.from(score.querySelectorAll('button')).find((b) => b.textContent === label) as HTMLElement
}

const openLog = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /^Fight log/ }))
}

const logLines = (): (string | null)[] => screen.queryAllByRole('listitem').map((li) => li.textContent)

const fightWithLog = (log: FightLogEntry[]): Fight => ({
  ...newFight('r', 'Aneta', 'b', 'Bob'),
  redPoints: 2,
  bluePoints: 1,
  log,
})


describe('KumiteTimerScreen fight log', () => {
  test('starts closed and counts nothing', () => {
    // arrange
    startSession()
    // act
    renderScreen()
    // assert
    expect(screen.getByRole('button', { name: /^Fight log/ })).toHaveTextContent('Fight log (0)')
    expect(logLines()).toEqual([])
  })

  test('keeps the log across a reset and records the reset itself', async () => {
    // arrange
    const user = userEvent.setup()
    startSession()
    renderScreen()
    // act
    await user.click(scoreButton('red', '+'))
    await user.click(screen.getByRole('button', { name: 'Start' }))
    // resetting is refused while the clock runs
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: 'Reset fight' }))
    await openLog(user)
    // assert - the score is back to zero but the record of it is not
    expect(logLines()).toEqual(['2:00AKA +1', '2:00Fight started', '2:00Paused', '2:00Fight reset'])
  })

  test('writes nothing when a press changes nothing', async () => {
    // arrange
    const user = userEvent.setup()
    startSession()
    renderScreen()
    await openLog(user)
    // act - the score is already zero, so the `0` button asks for what is set
    await user.click(scoreButton('red', '0'))
    // assert
    expect(logLines()).toEqual([])
    expect(screen.getByRole('button', { name: /^Fight log/ })).toHaveTextContent('Fight log (0)')
  })

  test('does not record which corner is shown on the left', async () => {
    // arrange
    const user = userEvent.setup()
    startSession()
    renderScreen()
    await user.click(scoreButton('red', '+'))
    await openLog(user)
    const before = logLines()
    // act
    await user.click(document.querySelectorAll('.__fight-stats__settings .__settings-btn')[0])
    // assert - it is a matter of the view, not of the fight
    expect(logLines()).toEqual(before)
  })

  test('carries on the log of a reopened fight and marks where it was reopened', async () => {
    // arrange
    const user = userEvent.setup()
    startSession(fightWithLog([
      { at: 1, fightTime: 120, event: { kind: 'POINTS', side: 'RED', delta: 2 } },
    ]))
    renderScreen()
    // act
    await openLog(user)
    // assert
    expect(logLines()).toEqual(['2:00AKA +2', '2:00Fight reopened (2:1)'])
  })

  test('does not mark a fight that was never played as reopened', async () => {
    // arrange
    const user = userEvent.setup()
    startSession(fightWithLog([]))
    renderScreen()
    // act
    await openLog(user)
    // assert
    expect(logLines()).toEqual([])
  })
})


describe('KumiteTimerScreen navigation', () => {
  const renderApp = (path: string): void => {
    render(
      <ReduxProvider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ReduxProvider>,
    )
  }

  test('leaving a tournament fight returns to the table, not to the set-up', async () => {
    // arrange
    const user = userEvent.setup()
    store.dispatch(setKumiteTimerTournament(120, 'Camp', 'GROUP', 3, [
      newCompetitor('Aneta'), newCompetitor('Bob'), newCompetitor('Cyril'),
    ]))
    startSession(newFight('r', 'Aneta', 'b', 'Bob'))
    renderApp('/kumite-timer')
    // act
    await user.click(screen.getByRole('button', { name: 'Back' }))
    // assert - ending the session must not send a redirect after the chosen route
    expect(await screen.findByRole('heading', { name: /Tournament: Camp/ })).toBeInTheDocument()
  })

  test('opening the screen without a session still lands on the set-up', async () => {
    // arrange
    store.dispatch(setNotActualKumiteTimer())
    // act
    renderApp('/kumite-timer')
    // assert - the reason the redirect exists in the first place
    expect(await screen.findByRole('heading', { name: 'Kumite Timer' })).toBeInTheDocument()
  })
})


describe('KumiteTimerScreen export', () => {
  test('offers the download on a device that cannot share files', () => {
    // arrange
    startSession()
    // act
    renderScreen()
    // assert - jsdom matches no media query, which is the desktop answer
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument()
  })

  test('hands over a csv file named by the moment it was exported', async () => {
    // arrange
    const user = userEvent.setup()
    exported.length = 0
    startSession()
    renderScreen()
    // act
    await user.click(screen.getByRole('button', { name: 'Download CSV' }))
    // assert
    expect(exported).toHaveLength(1)
    expect(exported[0].type).toBe('text/csv')
    expect(exported[0].name).toMatch(/^kumite-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/)
  })

  test('exports the fight as it stands on the screen, not as it was stored', async () => {
    // arrange
    const user = userEvent.setup()
    exported.length = 0
    startSession(fightWithLog([]))
    renderScreen()
    // act - the stored fight says 2:1, the screen is about to say 3:1
    await user.click(scoreButton('red', '+'))
    await user.click(screen.getByRole('button', { name: 'Download CSV' }))
    const rows = (await exported[0].text()).trimEnd().split('\r\n')
    // assert
    expect(rows).toHaveLength(2)
    expect(rows[1]).toContain('Aneta;Bob')
    expect(rows[1]).toContain('AKA +1')
    expect(rows[1].split(';').slice(-5)).toEqual(['3', '0', '1', '0', ''])
  })
})
