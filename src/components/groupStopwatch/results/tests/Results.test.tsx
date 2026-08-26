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

// the separator and the line ending are the CSV layer's business - see `utils/csv`.
// The heading row is this screen's own and is kept.
const exportedRows = (): Promise<string[]> => exported[exported.length - 1].text()
  .then((text) => text.trim().split('\r\n'))

const exportedFile = (): File => exported[exported.length - 1]

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

  /**
   * Every heading sorts, and pressing the same one again turns the order round. Pressing
   * once and looking only at the ascending order leaves the whole descending direction -
   * and the arrow that claims to show it - free to do nothing.
   */
  test.each([
    { name: 'number, ascending', heading: '#', presses: 1, expected: ['Cyril', 'Aneta', 'Bob'] },
    { name: 'number, descending', heading: '#', presses: 2, expected: ['Bob', 'Aneta', 'Cyril'] },
    { name: 'name, ascending', heading: 'Name', presses: 1, expected: ['Aneta', 'Bob', 'Cyril'] },
    { name: 'name, descending', heading: 'Name', presses: 2, expected: ['Cyril', 'Bob', 'Aneta'] },
    // place is the order the table opens in, so the first press turns it round
    { name: 'place, descending', heading: 'Place', presses: 1, expected: ['Cyril', 'Bob', 'Aneta'] },
    { name: 'place, back to ascending', heading: 'Place', presses: 2, expected: ['Aneta', 'Bob', 'Cyril'] },
  ])('sorts by $name', ({ heading, presses, expected }) => {
    // arrange
    renderResults(field())
    // act
    for (let i = 0; i < presses; ++i) {
      sortBy(heading)
    }
    // assert
    expect(column('name')).toEqual(expected)
  })

  test('sorts by place when the time heading is pressed', () => {
    // arrange - time and place are one order under two headings
    renderResults(field())
    // act - and place is already the order, so this press turns it round
    sortBy('Time')
    // assert - sorted by number it would be Cyril, Aneta, Bob; the tie has to reverse too
    expect(column('name')).toEqual(['Cyril', 'Bob', 'Aneta'])
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
      '#;Name;Time;Place',
      '1;Cyril;3.00;3',
      '2;Aneta;1.00;1',
      '3;Bob;1.00;1',
    ])
  })

  /**
   * Not decoration: `exportFile` decides between the share sheet and a download by the
   * type and the extension, so a file typed as plain text stops being shareable on a phone.
   * The name carries the local date and time, so two exports in one afternoon can be told
   * apart in a downloads folder.
   */
  test('names the file after the moment it was made and types it as CSV', () => {
    // arrange
    renderResults(field())
    // act
    fireEvent.click(screen.getByRole('button', { name: /csv/i }))
    // assert
    expect(exportedFile().name).toMatch(/^group-stopwatch-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/)
    expect(exportedFile().type).toBe('text/csv')
  })
})
