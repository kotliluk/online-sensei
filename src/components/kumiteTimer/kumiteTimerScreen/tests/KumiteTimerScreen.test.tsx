import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { KumiteTimerScreen } from '../KumiteTimerScreen'
import { store } from '../../../../redux/store'
import { setKumiteTimer, setTournamentFight } from '../../../../redux/kumiteTimer/actions'
import { Fight, newFight } from '../../../../types/tournament'
import { FightLogEntry } from '../../../../types/fightLog'


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
