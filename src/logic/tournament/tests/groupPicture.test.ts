import { drawTable, tableLayout } from '../groupPicture'


/** Every character the same width, so the arithmetic is checkable by hand. */
const measure = (text: string): number => text.length * 10

const rows = [
  ['', 'Aneta', 'Bob', 'W', 'D', 'L', '+', '-', '+/-'],
  ['Aneta', '', '3:1', '1', '0', '0', '3', '1', '2'],
  ['Bob', '1:3', '', '0', '0', '1', '1', '3', '-2'],
]

describe('tableLayout', () => {
  test('gives every column the width of its widest cell', () => {
    // act
    const layout = tableLayout(rows, measure)
    // assert - `Aneta` is the widest in column 0, so that column is wider than a tally one
    expect(layout.columnWidths[0]).toBeGreaterThan(layout.columnWidths[3])
    expect(layout.columnWidths[0]).toBe(50 + layout.padding * 2)
    // `3:1` would come to 54, which is under the minimum, so the minimum wins
    expect(layout.columnWidths[2]).toBe(layout.minColumnWidth)
  })

  test('is as wide as its columns and as tall as its rows', () => {
    // act
    const layout = tableLayout(rows, measure)
    // assert
    expect(layout.width).toBe(layout.columnWidths.reduce((a, b) => a + b, 0))
    expect(layout.height).toBe(rows.length * layout.rowHeight)
  })

  test('keeps a column readable even when every cell in it is tiny', () => {
    // act - a column of single characters must not collapse to a sliver
    const layout = tableLayout([['+'], ['1']], measure)
    // assert
    expect(layout.columnWidths[0]).toBeGreaterThanOrEqual(layout.minColumnWidth)
  })

  test('has an answer for a table with nothing in it', () => {
    // act
    const layout = tableLayout([], measure)
    // assert
    expect(layout.width).toBe(0)
    expect(layout.height).toBe(0)
  })
})

describe('drawTable', () => {
  /** Records what was asked of it, so the drawing can be checked without a canvas. */
  const fakeContext = () => {
    const texts: { text: string, x: number, y: number }[] = []
    const rects: number[][] = []

    return {
      calls: { texts, rects },
      context: {
        font: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        textAlign: '' as CanvasTextAlign,
        textBaseline: '' as CanvasTextBaseline,
        measureText: (text: string) => ({ width: measure(text) }),
        fillText: (text: string, x: number, y: number) => texts.push({ text, x, y }),
        fillRect: (...args: number[]) => rects.push(args),
        strokeRect: (...args: number[]) => rects.push(args),
        beginPath: () => undefined,
        moveTo: () => undefined,
        lineTo: () => undefined,
        stroke: () => undefined,
      } as unknown as CanvasRenderingContext2D,
    }
  }

  test('writes every cell that has something in it', () => {
    // arrange
    const { calls, context } = fakeContext()
    // act
    drawTable(rows, context, tableLayout(rows, measure))
    // assert - the empty cells of the diagonal are not written, everything else is
    expect(calls.texts.map((call) => call.text)).toEqual([
      'Aneta', 'Bob', 'W', 'D', 'L', '+', '-', '+/-',
      'Aneta', '3:1', '1', '0', '0', '3', '1', '2',
      'Bob', '1:3', '0', '0', '1', '1', '3', '-2',
    ])
  })

  test('keeps the six tally columns, which is what the table is read for', () => {
    // arrange
    const { calls, context } = fakeContext()
    // act
    drawTable(rows, context, tableLayout(rows, measure))
    // assert
    expect(calls.texts.map((call) => call.text)).toEqual(expect.arrayContaining(['W', 'D', 'L', '+', '-', '+/-']))
  })

  test('lays the rows out one under the other', () => {
    // arrange
    const { calls, context } = fakeContext()
    const layout = tableLayout(rows, measure)
    // act
    drawTable(rows, context, layout)
    // assert - three rows means three distinct baselines, each centred in its row.
    // Not looked up by cell text: `Aneta` appears both in the header and in a row.
    const baselines = [...new Set(calls.texts.map((call) => call.y))].sort((a, b) => a - b)
    expect(baselines).toEqual([
      layout.rowHeight / 2,
      layout.rowHeight * 1.5,
      layout.rowHeight * 2.5,
    ])
  })
})
