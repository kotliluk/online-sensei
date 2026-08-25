import { render } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { FightResultModal } from '../FightResultModal'
import { store } from '../../../../redux/store'
import { setKumiteTimerTournament, setTournamentFight } from '../../../../redux/kumiteTimer/actions'
import { Fight, newCompetitor, newFight, TournamentType } from '../../../../types/tournament'
import { Senchu } from '../../../../types/senchu'


const openFor = (type: TournamentType, changes: Partial<Fight>): void => {
  store.dispatch(setKumiteTimerTournament(
    90, 'Cup', type, 2, [newCompetitor('Aneta'), newCompetitor('Bob')],
  ))
  store.dispatch(setTournamentFight({ ...newFight('r', 'Aneta', 'b', 'Bob'), ...changes }))

  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer']}>
        <FightResultModal />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const offered = (): string => (document.querySelector('select') as HTMLSelectElement).value

/**
 * The dialog is the last thing between a fight and the table, and it is almost always
 * confirmed as it stands - so what it offers has to be the result that was fought for.
 * `defaultWinner` itself is covered in the tests of the tournament types; what is checked
 * here is that the dialog asks it at all.
 */
describe('FightResultModal - what it offers', () => {
  const drawn = { redPoints: 2, bluePoints: 2 }

  test.each([
    { name: 'senchu for aka', senchu: 'RED', expected: 'RED' },
    { name: 'senchu for ao', senchu: 'BLUE', expected: 'BLUE' },
  ] as { name: string, senchu: Senchu, expected: string }[])('offers the fighter who took $name', ({ senchu, expected }) => {
    // arrange + act
    openFor('GROUP', { ...drawn, senchu })
    // assert
    expect(offered()).toBe(expected)
  })

  test('offers a draw in a group where nothing separates them', () => {
    // arrange + act
    openFor('GROUP', drawn)
    // assert
    expect(offered()).toBe('DRAW')
  })

  test('offers the fighter the fifth foul was given against', () => {
    // arrange + act - five fouls hand the fight to the other corner
    openFor('TREE', { redFouls: 5, redPoints: 6, bluePoints: 0 })
    // assert
    expect(offered()).toBe('BLUE')
  })
})
