import { pictureScale } from '../download/picture'


/**
 * A group table as a picture.
 *
 * Drawn from the data rather than photographed off the screen. The table on
 * screen is a grid with a frozen row, a frozen column and two scrollbars, so a
 * picture of it would be a picture of whatever happened to be scrolled into
 * view - and getting the whole thing would mean rendering a second copy off
 * screen anyway. Drawing it costs about the same, needs no dependency, and the
 * cells come from the rows the csv export uses, so the picture and the file
 * cannot disagree.
 */

const FONT_SIZE = 16
const ROW_HEIGHT = 40
const CELL_PADDING = 12
const MIN_COLUMN_WIDTH = 56
const FONT = `${FONT_SIZE}px "Open Sans", sans-serif`

const LINE_COLOUR = '#999999'
const TEXT_COLOUR = '#0a0a0a'
const HEADER_BACKGROUND = '#ededed'

export type TableLayout = {
  columnWidths: number[],
  rowHeight: number,
  padding: number,
  minColumnWidth: number,
  width: number,
  height: number,
}

/**
 * How wide each column has to be for its widest cell to fit.
 *
 * Takes the measuring as an argument rather than reaching for a canvas, which
 * is what makes it checkable: jsdom has no 2d context at all, so a layout that
 * measured for itself could only ever be tested in a browser.
 */
export const tableLayout = (rows: string[][], measure: (text: string) => number): TableLayout => {
  const columns = Math.max(0, ...rows.map((row) => row.length))
  const columnWidths = Array.from({ length: columns }, (_, column) => {
    const widest = Math.max(0, ...rows.map((row) => measure(row[column] ?? '')))

    return Math.max(MIN_COLUMN_WIDTH, widest + CELL_PADDING * 2)
  })

  return {
    columnWidths,
    rowHeight: ROW_HEIGHT,
    padding: CELL_PADDING,
    minColumnWidth: MIN_COLUMN_WIDTH,
    width: columnWidths.reduce((total, width) => total + width, 0),
    height: rows.length * ROW_HEIGHT,
  }
}

/** Paints the table onto a context already sized and filled by the caller. */
export const drawTable = (rows: string[][], context: CanvasRenderingContext2D, layout: TableLayout): void => {
  const left = (column: number): number => {
    return layout.columnWidths.slice(0, column).reduce((total, width) => total + width, 0)
  }

  context.font = FONT
  context.textBaseline = 'middle'

  rows.forEach((row, rowIndex) => {
    const y = rowIndex * layout.rowHeight

    // the names along the top and down the side are what the eye lands on first
    if (rowIndex === 0) {
      context.fillStyle = HEADER_BACKGROUND
      context.fillRect(0, y, layout.width, layout.rowHeight)
    }

    row.forEach((cell, columnIndex) => {
      const x = left(columnIndex)
      const width = layout.columnWidths[columnIndex]

      context.strokeStyle = LINE_COLOUR
      context.lineWidth = 1
      context.strokeRect(x, y, width, layout.rowHeight)

      if (cell === '') {
        return
      }

      context.fillStyle = TEXT_COLOUR
      // names read from the left, everything else is a number and centres
      context.textAlign = columnIndex === 0 ? 'left' : 'center'
      context.fillText(
        cell,
        columnIndex === 0 ? x + layout.padding : x + width / 2,
        y + layout.rowHeight / 2,
      )
    })
  })
}

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/** The finished picture of a group table, on the light background every export gets. */
export const groupPictureBlob = async (rows: string[][], background: string): Promise<Blob | null> => {
  if (rows.length === 0) {
    return null
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (context === null) {
    return null
  }

  // measuring needs the font set, and setting the font needs a context - so the
  // layout is worked out on the same context that will draw it
  context.font = FONT
  const layout = tableLayout(rows, (text) => context.measureText(text).width)
  const scale = pictureScale(layout.width, layout.height)

  canvas.width = Math.round(layout.width * scale)
  canvas.height = Math.round(layout.height * scale)

  // sizing a canvas resets everything about its context, so the scale and the
  // font are set after, not before
  context.scale(scale, scale)
  context.fillStyle = background
  context.fillRect(0, 0, layout.width, layout.height)

  drawTable(rows, context, layout)

  return toBlob(canvas)
}
