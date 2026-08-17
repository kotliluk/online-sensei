import { JSX } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SetUpScreen } from '../SetUpScreen'
import { store } from '../../../../redux/store'
import { setGroupStopwatch } from '../../../../redux/groupStopwatch/actions'
import { CompetitorSetup, newCompetitorSetup } from '../../../../types/groupStopwatch'


const named = (...names: string[]): CompetitorSetup[] => names.map((name) => newCompetitorSetup(name))

/** The screen never shows the query string, and this test has to check what it became. */
const Query = (): JSX.Element => <span data-testid='query'>{useLocation().search}</span>

const renderScreen = (entry = '/group-stopwatch/set-up'): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={[entry]}>
        <SetUpScreen />
        <Query />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

// the count is a text input as well, so the names are taken from the competitor rows
const names = (): string[] => {
  return Array.from(document.querySelectorAll<HTMLInputElement>('.group-inputs input[type="text"]'))
    .map((input) => input.value)
}

const count = (): string => (document.querySelector('.set-up-input') as HTMLInputElement).value

const crosses = (): HTMLButtonElement[] => {
  return Array.from(document.querySelectorAll('.competitor-del-btn'))
}

describe('SetUpScreen of the group stopwatch', () => {
  describe('removing a competitor', () => {
    test('takes out the one whose cross was pressed and closes the gap', () => {
      // arrange
      store.dispatch(setGroupStopwatch(3, named('Aneta', 'Bob', 'Cyril')))
      renderScreen()
      // act
      fireEvent.click(crosses()[1])
      // assert - Cyril moves up into second place, and there are two competitors now
      expect(names()).toEqual(['Aneta', 'Cyril'])
      expect(count()).toBe('2')
    })

    test('does not pull in a competitor who was set up and then counted out', () => {
      // arrange - five names are stored, three are being used; the last two are out of
      // sight and must stay that way
      store.dispatch(setGroupStopwatch(3, named('Aneta', 'Bob', 'Cyril', 'Dana', 'Emil')))
      renderScreen()
      // act
      fireEvent.click(crosses()[1])
      // assert
      expect(names()).toEqual(['Aneta', 'Cyril'])
    })

    test('refuses to leave fewer competitors than the stopwatch takes', () => {
      // arrange
      store.dispatch(setGroupStopwatch(2, named('Aneta', 'Bob')))
      renderScreen()
      // assert - two is the minimum, so there is nothing to remove
      expect(crosses()).toHaveLength(2)
      crosses().forEach((cross) => expect(cross).toBeDisabled())
    })

    test('offers one cross per competitor that is shown', () => {
      // arrange
      store.dispatch(setGroupStopwatch(3, named('Aneta', 'Bob', 'Cyril')))
      // act
      renderScreen()
      // assert
      expect(crosses()).toHaveLength(3)
    })

    test('is an edit, so a shared link stops describing the screen', () => {
      // arrange
      store.dispatch(setGroupStopwatch(3, named('Aneta', 'Bob', 'Cyril')))
      renderScreen('/group-stopwatch/set-up?count=3&names=Aneta,Bob,Cyril')
      expect(screen.getByTestId('query').textContent).not.toBe('')
      // act
      fireEvent.click(crosses()[1])
      // assert - the link described three competitors and there are two
      expect(screen.getByTestId('query').textContent).toBe('')
    })
  })
})
