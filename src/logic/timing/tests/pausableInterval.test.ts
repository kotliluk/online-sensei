import { vi } from 'vitest'
import { PausableInterval } from '../pausableInterval'


describe('PausableInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('ticks once per interval while it runs', () => {
    // arrange
    const ticks: number[] = []
    new PausableInterval(() => ticks.push(1), 1000, true)
    // act
    vi.advanceTimersByTime(3000)
    // assert
    expect(ticks).toHaveLength(3)
  })

  test('stays quiet while it is paused', () => {
    // arrange
    const ticks: number[] = []
    const clock = new PausableInterval(() => ticks.push(1), 1000, true)
    vi.advanceTimersByTime(2000)
    // act
    clock.pause()
    vi.advanceTimersByTime(10_000)
    // assert
    expect(ticks).toHaveLength(2)
  })

  /**
   * The referee pauses mid-second and starts again. What is left of that second is what
   * the fight owes; starting the second over would hand it back, and over a fight full of
   * stoppages the clock on the wall and the clock on the table would drift apart.
   */
  test('finishes the second it was stopped in, and no more than that', () => {
    // arrange - two full seconds and half of a third
    const ticks: number[] = []
    const clock = new PausableInterval(() => ticks.push(1), 1000, true)
    vi.advanceTimersByTime(2500)
    clock.pause()
    // act
    clock.resume()
    vi.advanceTimersByTime(499)
    const early = ticks.length
    vi.advanceTimersByTime(1)
    // assert - half a second was owed, and half a second is what it waited
    expect(early).toBe(2)
    expect(ticks).toHaveLength(3)
  })

  test('goes back to whole intervals once the owed part is served', () => {
    // arrange
    const ticks: number[] = []
    const clock = new PausableInterval(() => ticks.push(1), 1000, true)
    vi.advanceTimersByTime(1750)
    clock.pause()
    clock.resume()
    // act - the quarter second still owed, then two whole seconds
    vi.advanceTimersByTime(250)
    vi.advanceTimersByTime(2000)
    // assert
    expect(ticks).toHaveLength(4)
  })

  test('starts the interval over when it is restarted, and takes the new callback', () => {
    // arrange
    const first: number[] = []
    const second: number[] = []
    const clock = new PausableInterval(() => first.push(1), 1000, true)
    vi.advanceTimersByTime(900)
    // act
    clock.restart(() => second.push(1), 500)
    vi.advanceTimersByTime(500)
    // assert - the first callback never sees the 900 ms it had already served
    expect(first).toHaveLength(0)
    expect(second).toHaveLength(1)
  })
})
