import { fireEvent, render, screen, within } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { SetUpScreenAdvanced } from '../SetUpScreenAdvanced'
import { store } from '../../../../redux/store'
import { setIntervalTimerAdvanced } from '../../../../redux/intervalTimer/actions'
import { Interval } from '../../../../types/interval'


const work = (name: string, duration: number): Interval => ({ type: 'work', name, duration })

const renderScreen = (intervals: Interval[]): HTMLElement => {
  store.dispatch(setIntervalTimerAdvanced(intervals, 3, false, 'NO_BEEP', 0))

  const { container } = render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/interval-timer/set-up-advanced']}>
        <SetUpScreenAdvanced />
      </MemoryRouter>
    </ReduxProvider>,
  )

  return container
}

/**
 * The intervals are the first list on the screen; each row nests a list of its own, and
 * further down sit fields (rounds, volume) that belong to no row. Scoping to it is what
 * keeps those out of the reading.
 */
const intervalList = (): HTMLElement => screen.getAllByRole('list')[0]

/**
 * Name and duration of every row, in the order the screen has them - both fields, because
 * a move that reordered the rows but left the values behind would read the same as a
 * correct one if only the names were checked.
 */
const rowValues = (): string[] => {
  return within(intervalList())
    .getAllByRole('textbox')
    .map(input => (input as HTMLInputElement).value)
}

const moveUp = (row: number): HTMLElement => {
  return within(intervalList()).getByRole('button', { name: `Move interval ${row} up` })
}

const moveDown = (row: number): HTMLElement => {
  return within(intervalList()).getByRole('button', { name: `Move interval ${row} down` })
}

const deleteRow = (row: number): HTMLElement => {
  return within(intervalList()).getByRole('button', { name: `Delete interval ${row}` })
}


describe('SetUpScreenAdvanced - reordering intervals', () => {
  test('moves an interval up, and its values go with it', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveUp(3))
    // assert
    expect(rowValues()).toEqual(['first', '11', 'third', '33', 'second', '22'])
  })

  test('moves an interval down, and its values go with it', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveDown(1))
    // assert
    expect(rowValues()).toEqual(['second', '22', 'first', '11', 'third', '33'])
  })

  test('walks an interval the whole way through the list', () => {
    // arrange
    renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    // act
    fireEvent.click(moveDown(1))
    fireEvent.click(moveDown(2))
    // assert
    expect(rowValues()).toEqual(['b', '2', 'c', '3', 'a', '1'])
  })

  test('renumbers the rows after a move', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22)])
    // act
    fireEvent.click(moveDown(1))
    // assert - what was row 1 is row 2 now, and the arrows it offers say so
    expect(rowValues()).toEqual(['second', '22', 'first', '11'])
    expect(moveUp(1)).toBeDisabled()
    expect(moveUp(2)).toBeEnabled()
  })

  test('offers no way up out of the first row and no way down out of the last', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act & assert
    expect(moveUp(1)).toBeDisabled()
    expect(moveDown(1)).toBeEnabled()
    expect(moveUp(3)).toBeEnabled()
    expect(moveDown(3)).toBeDisabled()
  })

  test('leaves the middle row both ways out', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act & assert
    expect(moveUp(2)).toBeEnabled()
    expect(moveDown(2)).toBeEnabled()
  })

  test('has nothing to press on a single interval', () => {
    // arrange
    renderScreen([work('only one', 11)])
    // act & assert - the last interval can go nowhere, and cannot be deleted either
    expect(moveUp(1)).toBeDisabled()
    expect(moveDown(1)).toBeDisabled()
    expect(deleteRow(1)).toBeDisabled()
  })

  test('does nothing when a disabled arrow is pressed anyway', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22)])
    // act
    fireEvent.click(moveUp(1))
    fireEvent.click(moveDown(2))
    // assert
    expect(rowValues()).toEqual(['first', '11', 'second', '22'])
  })

  test('reorders by button alone - nothing on the row is draggable any more', () => {
    // arrange & act
    const container = renderScreen([work('first', 11), work('second', 22)])
    // assert
    expect(container.querySelectorAll('[draggable]')).toHaveLength(0)
  })
})
