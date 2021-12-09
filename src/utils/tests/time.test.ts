import { parseTime, TimeUnit as TU } from '../time'


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
