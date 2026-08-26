import { vi } from 'vitest'
import { PausableStopwatch } from '../pausableStopwatch'


type Reading = { ms: number, wasPaused: boolean }

describe('PausableStopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const readings: Reading[] = []
  const record = (ms: number, wasPaused: boolean): void => {
    readings.push({ ms, wasPaused })
  }

  beforeEach(() => {
    readings.length = 0
  })

  const last = (): Reading => readings[readings.length - 1]

  test('reports the time that has run', () => {
    // arrange
    new PausableStopwatch(record, 100, true)
    // act
    vi.advanceTimersByTime(1000)
    // assert
    expect(last()).toEqual({ ms: 1000, wasPaused: false })
  })

  test('reports the reading it stopped at, and says it was a pause', () => {
    // arrange
    const watch = new PausableStopwatch(record, 100, true)
    vi.advanceTimersByTime(1000)
    // act
    watch.pause()
    // assert
    expect(last()).toEqual({ ms: 1000, wasPaused: true })
  })

  /**
   * The reading has to survive the pause. A race stopped for a false start and restarted
   * from what the watch already had is the whole reason this class is not a plain
   * `setInterval` over `Date.now()`.
   */
  test('carries the time it had over the pause', () => {
    // arrange
    const watch = new PausableStopwatch(record, 100, true)
    vi.advanceTimersByTime(1000)
    watch.pause()
    vi.advanceTimersByTime(60_000)
    // act
    watch.resume()
    vi.advanceTimersByTime(300)
    // assert - the minute it stood still counts for nothing, the second before it counts
    expect(last()).toEqual({ ms: 1300, wasPaused: false })
  })

  test('reports nothing while it is paused', () => {
    // arrange
    const watch = new PausableStopwatch(record, 100, true)
    vi.advanceTimersByTime(1000)
    watch.pause()
    const afterPausing = readings.length
    // act
    vi.advanceTimersByTime(5000)
    // assert
    expect(readings).toHaveLength(afterPausing)
  })

  test('goes back to zero when it is stopped', () => {
    // arrange
    const watch = new PausableStopwatch(record, 100, true)
    vi.advanceTimersByTime(1000)
    // act
    watch.stop()
    watch.restart()
    vi.advanceTimersByTime(300)
    // assert
    expect(last()).toEqual({ ms: 300, wasPaused: false })
  })
})
