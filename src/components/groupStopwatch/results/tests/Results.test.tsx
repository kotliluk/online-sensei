import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { Results } from '../Results'
import { store } from '../../../../redux/store'
import { Competitor, newCompetitor } from '../../../../types/groupStopwatch'
import { emptyFunc } from '../../../../utils/function'


/**
 * As elsewhere in this repo: only the last step out to the browser is replaced, because
 * `exportFile` reaches for `URL.createObjectURL`, which jsdom has not got. What is checked
 * here is the file the screen builds.
 */
const { exported } = vi.hoisted(() => ({ exported: [] as File[] }))

vi.mock('../../../../logic/download/exportFile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../logic/download/exportFile')>()),
  exportFile: (file: File): void => {
    exported.push(file)
  },
}))

const finisher = (id: number, name: string, ms: number | null): Competitor => ({
  ...newCompetitor(id, name, '#f99c3c'),
  time: ms,
  timeString: ms === null ? '--.--' : (ms / 1000).toFixed(2),
})

const renderResults = (competitors: Competitor[]): void => {
  render(
    <ReduxProvider store={store}>
      <Results competitors={competitors} onBackToStopwatch={emptyFunc} />
    </ReduxProvider>,
  )
}

const column = (name: string): string[] => {
  return [...document.querySelectorAll<HTMLElement>(`.competitor-row .competitor-${name}`)]
    .map((cell) => cell.textContent ?? '')
}

const sortBy = (heading: string): void => {
  const headers = [...document.querySelectorAll<HTMLElement>('thead th')]
  const found = headers.find((h) => h.textContent?.includes(heading))
  fireEvent.click(found as HTMLElement)
}

// the separator and the line ending are the CSV layer's business - see `utils/csv`
const exportedRows = (): Promise<string[]> => exported[exported.length - 1].text()
  .then((text) => text.trim().split('\r\n').slice(1))

beforeEach(() => {
  exported.length = 0
})

describe('Results of the group stopwatch', () => {
  // Cyril came in last, Aneta and Bob dead level
  const field = (): Competitor[] => [
    finisher(1, 'Cyril', 3000),
    finisher(2, 'Aneta', 1000),
    finisher(3, 'Bob', 1000),
  ]

  test('orders them by time', () => {
    // act
    renderResults(field())
    // assert
    expect(column('name')).toEqual(['Aneta', 'Bob', 'Cyril'])
  })

  /**
   * Two people who ran the same time share the place, and the place after them is left
   * out - two firsts and a third, never two firsts and a second. Times are taken by
   * tapping a card, so a dead heat is a normal outcome rather than a curiosity.
   */
  test('shares a place between equal times and skips the one after it', () => {
    // act
    renderResults(field())
    // assert
    expect(column('place')).toEqual(['1', '1', '3'])
  })

  test('puts whoever did not finish last', () => {
    // act
    renderResults([finisher(1, 'Cyril', null), finisher(2, 'Aneta', 1000)])
    // assert
    expect(column('name')).toEqual(['Aneta', 'Cyril'])
  })

  test('reorders when a column heading is pressed', () => {
    // arrange
    renderResults(field())
    // act
    sortBy('#')
    // assert - by number now, which is the order they were set up in
    expect(column('name')).toEqual(['Cyril', 'Aneta', 'Bob'])
  })

  test('exports the rows in the order they are shown, not the order they were computed', async () => {
    // arrange - shown by number, which is not the order by time
    renderResults(field())
    sortBy('#')
    // act
    fireEvent.click(screen.getByRole('button', { name: /csv/i }))
    // assert - the file is the table somebody is looking at; a file in another order is
    // a different result sheet from the one on screen
    await expect(exportedRows()).resolves.toEqual([
      '1;Cyril;3.00;3',
      '2;Aneta;1.00;1',
      '3;Bob;1.00;1',
    ])
  })
})
