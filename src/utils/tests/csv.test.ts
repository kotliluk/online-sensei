import { buildCsv } from '../csv'


describe('buildCsv', () => {
  test('has no byte order mark and ends with a line break', () => {
    // act
    const actual = buildCsv([['a']])
    // assert
    expect(actual).toBe('a\r\n')
  })

  test('separates cells with a semicolon and rows with CRLF', () => {
    // act
    const actual = buildCsv([['#', 'Name'], ['1', 'Jan']])
    // assert
    expect(actual).toBe('#;Name\r\n1;Jan\r\n')
  })

  test.each([
    { value: 'Jan', expected: 'Jan' },
    { value: 'Novák; Jan', expected: '"Novák; Jan"' },
    { value: 'Jan "Fast" Novák', expected: '"Jan ""Fast"" Novák"' },
    { value: 'Jan\nNovák', expected: '"Jan\nNovák"' },
    { value: 'Novák, Jan', expected: 'Novák, Jan' },
  ])('quotes $value only when it needs it', ({ value, expected }) => {
    // act
    const actual = buildCsv([[value]])
    // assert
    expect(actual).toBe(`${expected}\r\n`)
  })

  test('keeps an empty cell empty', () => {
    // act
    const actual = buildCsv([['1', '', '--.--']])
    // assert
    expect(actual).toBe('1;;--.--\r\n')
  })
})
