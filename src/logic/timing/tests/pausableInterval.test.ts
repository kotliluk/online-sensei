import { vi } from 'vitest'
import { PausableInterval } from '../pausableInterval'
import { emptyFunc } from '../../../utils/function'


/**
 * How far the wall clock has run ahead of the timers that have not been let through yet -
 * a tab in the background, a phone with the screen off. Fake timers move `Date.now()` and
 * the timer queue as one thing, so the gap between them that a sleeping device makes has
 * to be opened by hand.
 */
let skew = 0

describe('PausableInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    skew = 0
    const faked = Date.now.bind(Date)
    vi.spyOn(Date, 'now').mockImplementation(() => faked() + skew)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  /**
   * The whole point of the class, and the measurement that opened ticket 011: one second
   * of blocked event loop cost the old implementation 1102 ms of a 2002 ms wall time,
   * because it counted the callbacks it managed to deliver rather than the time that went
   * by. A fight clock that loses time whenever the phone is not looking is not a clock.
   */
  test('catches up the intervals the event loop slept through', () => {
    // arrange - one ordinary second first
    const ticks: number[] = []
    new PausableInterval((elapsed) => ticks.push(elapsed), 1000, true)
    vi.advanceTimersByTime(1000)
    // act - five seconds go by with the timers frozen, then one is let through
    skew = 5000
    vi.advanceTimersByTime(1000)
    // assert - seven seconds of wall time, seven seconds reported
    expect(ticks).toEqual([1, 6])
  })

  /**
   * Half a minute asleep must not turn into thirty callbacks: every one of them would be a
   * render, and the screen would replay the countdown a second at a time instead of showing
   * where the fight actually is.
   */
  test('reports a whole slept-through gap in one call, not one call per interval', () => {
    // arrange
    const ticks: number[] = []
    new PausableInterval((elapsed) => ticks.push(elapsed), 1000, true)
    // act
    skew = 30_000
    vi.advanceTimersByTime(1000)
    // assert
    expect(ticks).toEqual([31])
  })

  test('a pause is a pause however long the device sleeps through it', () => {
    // arrange - two seconds and a half, then stopped
    const ticks: number[] = []
    const clock = new PausableInterval((elapsed) => ticks.push(elapsed), 1000, true)
    vi.advanceTimersByTime(2500)
    clock.pause()
    // act - a minute passes while the clock is stopped, then it picks up again
    skew = 60_000
    clock.resume()
    vi.advanceTimersByTime(500)
    // assert - the half second it owed, and nothing at all for the minute it stood still
    expect(ticks).toEqual([1, 1, 1])
  })

  /**
   * The fight clock stops itself on reaching zero, from inside its own callback. The old
   * implementation put the interval back up as soon as that callback returned, so the horn
   * sounded again a second later with a second end in the log to match - see the tests of
   * `KumiteTimerScreen`, which is where it was visible.
   */
  test('stays stopped when the callback is what paused it', () => {
    // arrange
    const ticks: number[] = []
    const clock = new PausableInterval(emptyFunc, 1000)
    clock.restart(() => {
      ticks.push(1)
      clock.pause()
    }, 1000)
    // act
    vi.advanceTimersByTime(5000)
    // assert
    expect(ticks).toHaveLength(1)
  })

  test('takes the callback that restarted it from inside a tick', () => {
    // arrange - what the interval timer does at the boundary between two intervals
    const ticks: number[] = []
    const clock = new PausableInterval(emptyFunc, 1000)
    clock.restart(() => {
      ticks.push(1)
      clock.restart()
    }, 1000)
    // act
    vi.advanceTimersByTime(3000)
    // assert - three seconds, three ticks, and no doubled timer
    expect(ticks).toHaveLength(3)
  })
})
