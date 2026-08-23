import { fireEvent, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { SetUpScreen } from '../SetUpScreen'
import { store } from '../../../../redux/store'
import { setKumiteTimerTournament } from '../../../../redux/kumiteTimer/actions'
import { selectKumiteTimerCompetitors } from '../../../../redux/kumiteTimer/selector'
import { newCompetitor } from '../../../../types/tournament'


const renderScreen = (): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer/set-up']}>
        <SetUpScreen />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

/** The name inputs of the roster, which only exist once a tournament is being set up. */
const nameInputs = (): HTMLInputElement[] => {
  return [...document.querySelectorAll<HTMLInputElement>('li.no-border input[type="text"]')]
}

/** The roster only appears once "new tournament" is ticked. */
const startTournament = (): void => {
  const checkbox = document.querySelector<HTMLInputElement>('input[type="checkbox"]')
  fireEvent.click(checkbox as HTMLInputElement)
}

describe('SetUpScreen - roster', () => {
  test('spreads a pasted list of names across the rows', () => {
    // arrange
    renderScreen()
    startTournament()
    // act - a comma separated list, which is how a roster gets in
    fireEvent.change(nameInputs()[0], { target: { value: 'Alice, Bob, Charles' } })
    // assert
    expect(nameInputs().slice(0, 3).map((i) => i.value)).toEqual(['Alice', 'Bob', 'Charles'])
  })

  test('fills what fits when the pasted list is longer than the roster', () => {
    // arrange - four rows by default, and six names pasted into the last one
    renderScreen()
    startTournament()
    const inputs = nameInputs()
    // act
    fireEvent.change(inputs[inputs.length - 1], { target: { value: 'Xena, Yuri, Zoe' } })
    // assert - the row it was pasted into must take the first name rather than nothing
    expect(nameInputs()[inputs.length - 1].value).toBe('Xena')
  })

  test('does not reach past the end of the roster', () => {
    // arrange
    renderScreen()
    startTournament()
    const inputs = nameInputs()
    // act + assert - writing past the last row threw, which lost the whole paste
    expect(() => {
      fireEvent.change(inputs[inputs.length - 1], { target: { value: 'Xena, Yuri, Zoe' } })
    }).not.toThrow()
  })

  test('editing a name does not reach into the store', () => {
    // arrange - a running tournament whose competitors are in the store
    store.dispatch(setKumiteTimerTournament(
      90, 'Cup', 'TREE', 2, [newCompetitor('Aneta'), newCompetitor('Bob')],
    ))
    const before = selectKumiteTimerCompetitors(store.getState())[0].name
    renderScreen()
    startTournament()
    // act - type a new name but never press Start
    fireEvent.change(nameInputs()[0], { target: { value: 'Someone else' } })
    // assert - nothing was confirmed, so the running tournament keeps its roster
    expect(selectKumiteTimerCompetitors(store.getState())[0].name).toBe(before)
  })
})

describe('SetUpScreen - starting a tournament', () => {
  /** The last of the set-up fields is the number of competitors. */
  const countInput = (): HTMLInputElement => {
    const fields = document.querySelectorAll<HTMLInputElement>('.set-up-input')
    return fields[fields.length - 1]
  }

  const startButton = (): HTMLButtonElement => {
    return screen.getByRole<HTMLButtonElement>('button', { name: /start/i })
  }

  test('start is available for a valid roster', () => {
    // arrange
    renderScreen()
    startTournament()
    // act + assert
    expect(startButton().disabled).toBe(false)
  })

  test('start is refused while the number of competitors is out of range', () => {
    // arrange - clearing the field leaves a zero, which the input already marks as invalid
    renderScreen()
    startTournament()
    // act
    fireEvent.change(countInput(), { target: { value: '' } })
    // assert - otherwise a tournament gets built out of nobody: an empty group table, or a
    // final with two empty corners that cannot be clicked and can only be cancelled
    expect(startButton().disabled).toBe(true)
  })

  test('start is refused for more competitors than the tournament allows', () => {
    // arrange
    renderScreen()
    startTournament()
    // act
    fireEvent.change(countInput(), { target: { value: '1000' } })
    // assert
    expect(startButton().disabled).toBe(true)
  })

  test('start stays available when no tournament is being set up', () => {
    // arrange - the count is only meaningful for a tournament
    renderScreen()
    // act + assert
    expect(startButton().disabled).toBe(false)
  })
})
