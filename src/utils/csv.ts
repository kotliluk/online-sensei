/**
 * Builds the content of a CSV file: UTF-8, no byte order mark, semicolon
 * separated.
 *
 * Spreadsheets do not read the separator from the file. Excel takes it from
 * the system list separator, which is a semicolon in the European locales this
 * app is used in, while LibreOffice and Google Sheets detect it either way -
 * so a semicolon is the choice that works in the most places.
 *
 * There is deliberately no byte order mark, even though it is what makes Excel
 * on Windows decode UTF-8 rather than the system code page. It was measured on
 * a phone instead of assumed: the Google Sheets app on Android reads a local
 * file as if it were single byte whatever the file says - a mark, a utf-16
 * mark, none of it changes the result - and a utf-8 mark then shows up as
 * `\u00EF\u00BB\u00BF` in the first cell. So the mark cannot rescue accented names there, it
 * can only add visible rubbish to rosters that have none, and the app is used
 * on a phone far more than in Excel on Windows.
 *
 * Accented names do survive on Android through the share sheet, because
 * uploading to Drive converts the file server side rather than in the app.
 */

const SEPARATOR = ';'
const LINE_END = '\r\n'

const NEEDS_QUOTES = new RegExp(`["${SEPARATOR}\\r\\n]`)

/** Quotes a cell when it contains a separator, a quote or a line break. */
const escapeCell = (value: string): string => {
  return NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * Without the `;charset=utf-8` parameter on purpose. It buys nothing - a
 * downloaded file keeps no content type once it is on disk - and Android hands
 * a shared file over as a content:// uri whose type it is, where a parameter
 * is one more thing that can be rejected.
 */
export const CSV_MIME_TYPE = 'text/csv'

export const buildCsv = (rows: string[][]): string => {
  const body = rows.map((row) => row.map(escapeCell).join(SEPARATOR)).join(LINE_END)

  return `${body}${LINE_END}`
}
