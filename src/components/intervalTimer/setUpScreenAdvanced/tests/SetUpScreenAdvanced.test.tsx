import { vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { SetUpScreenAdvanced } from '../SetUpScreenAdvanced'
import { store } from '../../../../redux/store'
import { setIntervalTimerAdvanced } from '../../../../redux/intervalTimer/actions'
import { setTranslation } from '../../../../redux/page/actions'
import { Interval } from '../../../../types/interval'
import { ArrowUp } from '../../../icons/ArrowUp'
import { ArrowDown } from '../../../icons/ArrowDown'
import { ReactElement } from 'react'


const work = (name: string, duration: number): Interval => ({ type: 'work', name, duration })
const pause = (name: string, duration: number): Interval => ({ type: 'pause', name, duration })

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

const rows = (): HTMLElement[] => Array.from(intervalList().children) as HTMLElement[]

/**
 * All three fields of every row, in the order the screen has them. All three, because a
 * move that reordered the rows and left a value behind would read the same as a correct
 * one if only some of them were checked.
 */
const rowValues = (): string[][] => rows().map(row => {
  const fields: HTMLElement[] = [
    within(row).getByRole('combobox'),
    ...within(row).getAllByRole('textbox'),
  ]

  return fields.map(field => (field as HTMLInputElement).value)
})

const rowNames = (): string[] => rowValues().map(([, name]) => name)

/** The markup an icon really draws, taken from the icon itself rather than written down. */
const shapeOf = (icon: ReactElement): string => {
  const { container } = render(icon)

  return container.querySelector('svg')?.innerHTML ?? ''
}

/** The `1)`, `2)` … the row shows - which is a different thing from what its buttons say. */
const rowNumbers = (): string[] => rows().map(row => within(row).getByText(/^\d+\)$/).textContent ?? '')

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
  beforeEach(() => {
    // the language outlives a test - it goes to localStorage - and one test below changes it
    store.dispatch(setTranslation('EN'))
  })

  test('moves an interval up, and its values go with it', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveUp(3))
    // assert
    expect(rowValues()).toEqual([
      ['work', 'first', '11'],
      ['work', 'third', '33'],
      ['work', 'second', '22'],
    ])
  })

  test('moves an interval down, and its values go with it', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveDown(1))
    // assert
    expect(rowValues()).toEqual([
      ['work', 'second', '22'],
      ['work', 'first', '11'],
      ['work', 'third', '33'],
    ])
  })

  test('carries the type with the interval and not with the row', () => {
    // arrange
    renderScreen([work('sprint', 20), pause('rest', 40)])
    // act
    fireEvent.click(moveUp(2))
    // assert
    expect(rowValues()).toEqual([
      ['pause', 'rest', '40'],
      ['work', 'sprint', '20'],
    ])
  })

  test('walks an interval the whole way through the list', () => {
    // arrange
    renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    // act
    fireEvent.click(moveDown(1))
    fireEvent.click(moveDown(2))
    // assert
    expect(rowNames()).toEqual(['b', 'c', 'a'])
  })

  test('renumbers what the rows show, not only what their buttons say', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveDown(1))
    // assert - the visible prefix counts from one and follows the row, not the interval
    expect(rowNumbers()).toEqual(['1)', '2)', '3)'])
    expect(rowNames()).toEqual(['second', 'first', 'third'])
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

  test('points each arrow the way it moves', () => {
    // arrange - what the two icons really draw. Asking for a class name instead would pass
    // just as happily with the wrong icon under it, since the class is written by hand
    const upShape = shapeOf(<ArrowUp />)
    const downShape = shapeOf(<ArrowDown />)
    expect(upShape).not.toBe(downShape)
    renderScreen([work('first', 11), work('second', 22)])
    // act & assert - what a finger goes by is the icon; the label is for a reader
    expect(moveUp(2).querySelector('svg')?.innerHTML).toBe(upShape)
    expect(moveDown(1).querySelector('svg')?.innerHTML).toBe(downShape)
  })

  test('has nothing to press on a single interval', () => {
    // arrange
    renderScreen([work('only one', 11)])
    // act & assert - the last interval can go nowhere, and cannot be deleted either
    expect(moveUp(1)).toBeDisabled()
    expect(moveDown(1)).toBeDisabled()
    expect(deleteRow(1)).toBeDisabled()
  })

  test('lets an interval go while there is more than one', () => {
    // arrange
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    expect(deleteRow(2)).toBeEnabled()
    fireEvent.click(deleteRow(2))
    // assert
    expect(rowNames()).toEqual(['first', 'third'])
  })

  test('does nothing when a disabled arrow is pressed anyway', () => {
    // arrange - three of them, because on two the unguarded move happens to be a no-op
    // at both ends and the test could not tell a guard from a coincidence
    renderScreen([work('first', 11), work('second', 22), work('third', 33)])
    // act
    fireEvent.click(moveUp(1))
    fireEvent.click(moveDown(3))
    // assert
    expect(rowNames()).toEqual(['first', 'second', 'third'])
  })

  test('reorders by button alone - nothing of the drag is left on the row', () => {
    // arrange & act
    const container = renderScreen([work('first', 11), work('second', 22)])
    // assert - the row count first, so an empty screen cannot pass the two absences
    expect(rows()).toHaveLength(2)
    expect(container.querySelectorAll('[draggable]')).toHaveLength(0)
    expect(container.querySelectorAll('.advanced-interval-dnd-end')).toHaveLength(0)
  })

  test('names the arrows in Czech as well, row number and all', () => {
    // arrange
    store.dispatch(setTranslation('CS'))
    renderScreen([work('first', 11), work('second', 22)])
    // act & assert - a label that dropped its parameter would leave every row the same
    expect(within(intervalList()).getByRole('button', { name: 'Posunout 2. interval nahoru' })).toBeEnabled()
    expect(within(intervalList()).getByRole('button', { name: 'Posunout 1. interval dolů' })).toBeEnabled()
  })
})

describe('SetUpScreenAdvanced - following the interval that moved', () => {
  beforeEach(() => {
    store.dispatch(setTranslation('EN'))
  })

  test('moves the focus onto the row the interval landed on', () => {
    // arrange
    renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    // act
    fireEvent.click(moveDown(1))
    // assert - rows are keyed by position, so without this the pressed button would stay
    // put and belong to whatever took the old row
    expect(document.activeElement).toBe(moveDown(2))
  })

  test('lets the same button be pressed twice to move one interval twice', () => {
    // arrange
    renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    const pressed = moveDown(1)
    // act - the very same element, the way a keyboard repeating Enter would
    fireEvent.click(pressed)
    fireEvent.click(document.activeElement as HTMLElement)
    // assert
    expect(rowNames()).toEqual(['b', 'c', 'a'])
  })

  test('hands focus to the other arrow when the one used runs out of list', () => {
    // arrange
    renderScreen([work('a', 1), work('b', 2)])
    // act - 'a' lands last, so the arrow that took it there is disabled on arrival
    fireEvent.click(moveDown(1))
    // assert
    expect(moveDown(2)).toBeDisabled()
    expect(document.activeElement).toBe(moveUp(2))
  })

  test('marks the row the interval landed on', () => {
    // arrange
    const container = renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    // act
    fireEvent.click(moveDown(1))
    // assert
    const marked = container.querySelectorAll('.just-moved')
    expect(marked).toHaveLength(1)
    expect(within(marked[0] as HTMLElement).getByText('2)')).toBeInTheDocument()
  })
})

describe('SetUpScreenAdvanced - the mark on a moved row does not stay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    store.dispatch(setTranslation('EN'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('lets the mark go once it has been seen', () => {
    // arrange
    const container = renderScreen([work('a', 1), work('b', 2), work('c', 3)])
    fireEvent.click(moveDown(1))
    expect(container.querySelectorAll('.just-moved')).toHaveLength(1)
    // act
    act(() => {
      vi.advanceTimersByTime(1200)
    })
    // assert
    expect(container.querySelectorAll('.just-moved')).toHaveLength(0)
  })
})
