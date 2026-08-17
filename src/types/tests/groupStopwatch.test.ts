import { clearCompetitorTime, Competitor, newCompetitor, shiftCompetitorTime } from '../groupStopwatch'


const finished = (time: number): Competitor => ({
  ...newCompetitor(1, 'Aneta', '#f99c3c'),
  time,
  timeString: 'set by the test',
  lastClick: 1234,
})

describe('shiftCompetitorTime', () => {
  test('moves the saved time by the given step and rewrites what is shown', () => {
    // arrange
    const competitor = finished(12_500)
    // act
    const shifted = shiftCompetitorTime(competitor, 1000, 'seconds')
    // assert
    expect(shifted.time).toBe(13_500)
    expect(shifted.timeString).toBe('13.50')
  })

  test('stops at zero instead of going negative', () => {
    // arrange - half a second in, a second back
    const competitor = finished(500)
    // act
    const shifted = shiftCompetitorTime(competitor, -1000, 'seconds')
    // assert
    expect(shifted.time).toBe(0)
    expect(shifted.timeString).toBe('00.00')
  })

  test('writes the time the way the running clock writes it', () => {
    // arrange - past a minute the screen pads everything, and a corrected time must not
    // suddenly look different from the one next to it
    const competitor = finished(12_500)
    // act
    const shifted = shiftCompetitorTime(competitor, 1000, 'minutes')
    // assert
    expect(shifted.timeString).toBe('00:13.50')
  })

  test('leaves a competitor who has not finished alone', () => {
    // arrange
    const competitor = newCompetitor(2, 'Bob', '#f99c3c')
    // act
    const shifted = shiftCompetitorTime(competitor, 1000, 'seconds')
    // assert - nothing to move, so nothing moves
    expect(shifted).toBe(competitor)
  })

  test('keeps everything else about the competitor', () => {
    // arrange - `lastClick` drives the two second rewrite window, so a correction
    // must not reopen or close it
    const competitor = finished(12_500)
    // act
    const shifted = shiftCompetitorTime(competitor, 1000, 'seconds')
    // assert
    expect(shifted.lastClick).toBe(1234)
    expect(shifted.id).toBe(1)
    expect(shifted.name).toBe('Aneta')
  })
})

describe('clearCompetitorTime', () => {
  test('puts the competitor back to not having run', () => {
    // arrange
    const competitor = finished(12_500)
    // act
    const cleared = clearCompetitorTime(competitor, 'seconds')
    // assert
    expect(cleared.time).toBeNull()
    expect(cleared.timeString).toBe('--.--')
  })

  test('uses the placeholder of the unit the clock is in', () => {
    // arrange
    const competitor = finished(72_500)
    // act
    const cleared = clearCompetitorTime(competitor, 'minutes')
    // assert
    expect(cleared.timeString).toBe('--:--.--')
  })
})
