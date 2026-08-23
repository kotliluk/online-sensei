import { parseMinTime, parseTime, TimeUnit as TU } from '../time'


describe('parseTimeFromSeconds - default options', () => {
  test.each([
    { sec: 0, expected: '0:00' },
    { sec: 1, expected: '0:01' },
    { sec: 10, expected: '0:10' },
    { sec: 60, expected: '1:00' },
    { sec: 75, expected: '1:15' },
    { sec: 143, expected: '2:23' },
    { sec: 3600, expected: '60:00' },
    { sec: 3675, expected: '61:15' },
  ])('%s', ({ sec, expected }) => {
    // act
    const actual = parseTime(sec)
    // assert
    expect(actual).toBe(expected)
  })
})

describe('parseTimeFromSeconds - given options', () => {
  test.each([
    { input: 0, unit: TU.SECONDS, maxUnit: TU.HOURS, minUnit: TU.SECONDS, expected: '0:00:00' },
    { input: 1, unit: TU.SECONDS, maxUnit: TU.HOURS, minUnit: TU.SECONDS, expected: '0:00:01' },
    { input: 10, unit: TU.SECONDS, maxUnit: TU.HOURS, minUnit: TU.TENTHS, expected: '0:00:10.0' },
    { input: 3675.18, unit: TU.SECONDS, maxUnit: TU.HOURS, minUnit: TU.TENTHS, expected: '1:01:15.1' },
    { input: 10, unit: TU.TENTHS, maxUnit: TU.HOURS, minUnit: TU.SECONDS, expected: '0:00:01' },
    { input: 1, unit: TU.HOURS, maxUnit: TU.HOURS, minUnit: TU.HOURS, expected: '1' },
    { input: 1, unit: TU.HOURS, maxUnit: TU.MINUTES, minUnit: TU.MINUTES, expected: '60' },
  ])('%s', ({ input, unit, maxUnit, minUnit, expected }) => {
    // act
    const actual = parseTime(input, unit, maxUnit, minUnit)
    // assert
    expect(actual).toBe(expected)
  })
})

describe('parseMinTime', () => {
  test.each([
    { sec: 0, expected: '0' },
    { sec: 1, expected: '1' },
    { sec: 10, expected: '10' },
    { sec: 60, expected: '1:00' },
    { sec: 75, expected: '1:15' },
    { sec: 143, expected: '2:23' },
    { sec: 3600, expected: '1:00:00' },
    { sec: 3675, expected: '1:01:15' },
  ])('%s', ({ sec, expected }) => {
    // act
    const actual = parseMinTime(sec)
    // assert
    expect(actual).toBe(expected)
  })
})

describe('parseMinTime - hundredths', () => {
  /**
   * Times arrive here as whole milliseconds divided by a thousand, and `12340 / 1000` is
   * a float slightly under `12.34`. Subtracting the whole seconds off that float and
   * truncating what is left therefore loses a hundredth on roughly every second value
   * that lands on one.
   */
  test.each([
    { ms: 12_340, expected: '12.34' },
    { ms: 1200, expected: '1.20' },
    { ms: 2900, expected: '2.90' },
    { ms: 5600, expected: '5.60' },
    { ms: 8700, expected: '8.70' },
    { ms: 12_460, expected: '12.46' },
    { ms: 999, expected: '0.99' },
  ])('writes $ms ms as $expected', ({ ms, expected }) => {
    // act + assert
    expect(parseMinTime(ms / 1000, 2)).toBe(expected)
  })

  test('never disagrees with the milliseconds it was given', () => {
    // arrange - every hundredth of the first ten minutes
    const wrong: string[] = []
    // act
    for (let ms = 0; ms < 600_000; ms += 10) {
      const want = Math.floor(ms / 10) % 100
      const written = parseMinTime(ms / 1000, 2)
      const got = Number(written.slice(written.indexOf('.') + 1))
      if (got !== want) { wrong.push(`${ms} ms -> ${written}`) }
    }
    // assert
    expect(wrong).toEqual([])
  })

  test('rounds nothing - a tenth is truncated the same way', () => {
    // act + assert - 1290 ms is one and two tenths, not one and three
    expect(parseMinTime(1290 / 1000, 1)).toBe('1.2')
  })
})

describe('parseMinTime - hundredths past a minute', () => {
  /** Minutes are subtracted off the float too, so the recovery has to survive that as well. */
  test.each([
    { ms: 72_340, pad: 'minutes' as const, expected: '01:12.34' },
    { ms: 72_340, pad: undefined, expected: '1:12.34' },
    { ms: 3_612_340, pad: 'hours' as const, expected: '01:00:12.34' },
  ])('writes $ms ms as $expected', ({ ms, pad, expected }) => {
    // act + assert
    expect(parseMinTime(ms / 1000, 2, pad)).toBe(expected)
  })
})
