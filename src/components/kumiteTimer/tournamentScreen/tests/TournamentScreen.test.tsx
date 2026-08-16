import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { TournamentScreen } from '../TournamentScreen'
import { store } from '../../../../redux/store'
import { AppThunkDispatch } from '../../../../redux/thunk'
import { saveTournamentFight, setKumiteTimerTournament } from '../../../../redux/kumiteTimer/actions'
import { setModalWindow } from '../../../../redux/page/actions'
import { Competitor, FightResult, newCompetitor } from '../../../../types/tournament'
import { FightLogEntry } from '../../../../types/fightLog'


/**
 * As in the fight screen tests: only the last step out to the browser is replaced,
 * because `exportFile` reaches for `URL.createObjectURL`, which jsdom has not got.
 * What matters here is the file the screen builds, not the handing over of it.
 */
const { exported } = vi.hoisted(() => ({ exported: [] as File[] }))

vi.mock('../../../../logic/download/exportFile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../logic/download/exportFile')>()),
  exportFile: (file: File): void => {
    exported.push(file)
  },
}))

const roster: Competitor[] = ['Aneta', 'Bob', 'Cyril'].map((name) => newCompetitor(name))

const renderScreen = (): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer/tournament']}>
        <TournamentScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const log: FightLogEntry[] = [
  { at: 1000, fightTime: 120, event: { kind: 'START' } },
  { at: 2000, fightTime: 118, event: { kind: 'POINTS', side: 'RED', delta: 3 } },
]

/** Finishes the fight of the first pairing, the way the result modal does. */
const playFirstFight = (): void => {
  const fight = store.getState().kumiteTimer.group[0][1]
  const result: FightResult = {
    uuid: fight.uuid,
    type: fight.type,
    winner: 'RED',
    redPoints: 3,
    redFouls: 0,
    bluePoints: 1,
    blueFouls: 0,
    senchu: 'NONE',
    oppositeFight: fight.oppositeFight,
    log,
  }

  // the store is typed for plain actions; saving a result is a thunk, as it is in the app
  const dispatch = store.dispatch as AppThunkDispatch

  dispatch(saveTournamentFight(result))
}

const rowsOf = async (file: File): Promise<string[][]> => {
  const text = await file.text()

  return text.trimEnd().split('\r\n').map((row) => row.split(';'))
}

describe('TournamentScreen export', () => {
  beforeEach(() => {
    exported.length = 0
    // the modal state is shared, and one left open here leaves the next test with two screens
    store.dispatch(setModalWindow('NONE'))
    store.dispatch(setKumiteTimerTournament(120, 'Camp', 'GROUP', 3, roster))
  })

  test('offers both files, in their own row above cancel and back', () => {
    // act
    renderScreen()
    // assert - inside that row, so moving a button elsewhere fails the test
    const row = document.querySelector('.tournament-export') as HTMLElement
    expect(row.querySelectorAll('button')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Download log' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download overview' })).toBeInTheDocument()
  })

  test('writes the fights that were played into the log file', async () => {
    // arrange
    const user = userEvent.setup()
    playFirstFight()
    renderScreen()
    // act
    await user.click(screen.getByRole('button', { name: 'Download log' }))
    const rows = await rowsOf(exported[0])
    // assert - a header and the two logged events of the one fight that happened
    expect(rows).toHaveLength(3)
    expect(rows.slice(1).map((row) => [row[0], row[1], row[2], row[5]])).toEqual([
      ['Camp', 'Aneta', 'Bob', 'START'],
      ['Camp', 'Aneta', 'Bob', 'POINTS'],
    ])
  })

  test('writes the table itself into the overview file', async () => {
    // arrange
    const user = userEvent.setup()
    playFirstFight()
    renderScreen()
    // act
    await user.click(screen.getByRole('button', { name: 'Download overview' }))
    const rows = await rowsOf(exported[0])
    // assert - the score stands in Aneta's row and mirrored in Bob's
    expect(rows[0].slice(0, 4)).toEqual(['', 'Aneta', 'Bob', 'Cyril'])
    expect(rows[1].slice(1, 4)).toEqual(['', '3:1', ''])
    expect(rows[2].slice(1, 4)).toEqual(['1:3', '', ''])
  })

  test('names the two files apart, and after the tournament', async () => {
    // arrange
    const user = userEvent.setup()
    renderScreen()
    // act
    await user.click(screen.getByRole('button', { name: 'Download log' }))
    await user.click(screen.getByRole('button', { name: 'Download overview' }))
    // assert
    expect(exported.map((file) => file.type)).toEqual(['text/csv', 'text/csv'])
    expect(exported[0].name).toMatch(/^kumite-camp-log-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/)
    expect(exported[1].name).toMatch(/^kumite-camp-overview-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/)
  })

  test('exports a tournament nobody has fought in without falling over', async () => {
    // arrange
    const user = userEvent.setup()
    renderScreen()
    // act
    await user.click(screen.getByRole('button', { name: 'Download log' }))
    const rows = await rowsOf(exported[0])
    // assert - the header on its own, and the draw sheet still worth having
    expect(rows).toHaveLength(1)
  })

  /*
   * A bracket is not rendered here on purpose: `react-d3-tree` mounts a d3 zoom
   * behaviour that reads the width off a laid out `<svg>`, and jsdom lays nothing
   * out, so the screen throws before any assertion is reached. Shimming the size
   * would only prove the shim. The bracket is covered by the unit tests of
   * `buildTournamentOverviewCsv` and by the browser suite, which has a real engine.
   */
})
