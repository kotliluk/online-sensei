import { parseTimeFromSeconds } from '../time'


test.each([
  { sec: 0, expected: '0:00' },
  { sec: 1, expected: '0:01' },
  { sec: 10, expected: '0:10' },
  { sec: 60, expected: '1:00' },
  { sec: 75, expected: '1:15' },
  { sec: 143, expected: '2:23' },
])('', ({ sec, expected }) => {
  // act
  const actual = parseTimeFromSeconds(sec)
  // assert
  expect(actual).toBe(expected)
})
