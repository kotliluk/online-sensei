/**
 * Builds the content of a CSV file.
 *
 * The separator is a semicolon, not a comma. Spreadsheets do not read the
 * separator from the file - Excel takes it from the system list separator,
 * which is a semicolon in the European locales this app is used in, while
 * LibreOffice and Google Sheets detect it either way.
 *
 * The content starts with a byte order mark for the same reason: without it
 * Excel decodes the file in the system code page and mangles every accented
 * name.
 */

const SEPARATOR = ';'
const LINE_END = '\r\n'
const BOM = '\uFEFF'

const NEEDS_QUOTES = new RegExp(`["${SEPARATOR}\\r\\n]`)

/** Quotes a cell when it contains a separator, a quote or a line break. */
const escapeCell = (value: string): string => {
  return NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export const CSV_MIME_TYPE = 'text/csv;charset=utf-8'

export const buildCsv = (rows: string[][]): string => {
  const body = rows.map((row) => row.map(escapeCell).join(SEPARATOR)).join(LINE_END)

  return `${BOM}${body}${LINE_END}`
}
