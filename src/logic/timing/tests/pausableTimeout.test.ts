import { vi } from 'vitest'
import { PausableTimeout } from '../pausableTimeout'


describe('PausableTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('fires once the whole time has passed', () => {
    // arrange
    const fired: number[] = []
    new PausableTimeout(() => fired.push(1), 1000, true)
    // act
    vi.advanceTimersByTime(999)
    const early = fired.length
    vi.advanceTimersByTime(1)
    // assert
    expect(early).toBe(0)
    expect(fired).toHaveLength(1)
  })

  test('stays quiet while it is paused, however long that is', () => {
    // arrange
    const fired: number[] = []
    const timeout = new PausableTimeout(() => fired.push(1), 1000, true)
    vi.advanceTimersByTime(400)
    // act
    timeout.pause()
    vi.advanceTimersByTime(60_000)
    // assert
    expect(fired).toHaveLength(0)
  })

  /**
   * The whole point of the class. Reactions arms the next signal with one of these and
   * pauses it when the referee does: coming back from that pause with the full interval
   * again would hand the trainee a wait they had already served.
   */
  test('picks up with what was left of it, not with the whole of it again', () => {
    // arrange - three seconds of five have run
    const fired: number[] = []
    const timeout = new PausableTimeout(() => fired.push(1), 5000, true)
    vi.advanceTimersByTime(3000)
    timeout.pause()
    // act
    timeout.resume()
    vi.advanceTimersByTime(1999)
    const early = fired.length
    vi.advanceTimersByTime(1)
    // assert - two seconds were left, and two seconds is what it waits
    expect(early).toBe(0)
    expect(fired).toHaveLength(1)
  })

  test('fires once, not once for every pause on the way there', () => {
    // arrange
    const fired: number[] = []
    const timeout = new PausableTimeout(() => fired.push(1), 3000, true)
    // act - stopped and started twice before its time is up
    for (let i = 0; i < 2; ++i) {
      vi.advanceTimersByTime(1000)
      timeout.pause()
      timeout.resume()
    }
    vi.advanceTimersByTime(1000)
    // assert
    expect(fired).toHaveLength(1)
  })

  /**
   * A sharp edge, pinned here rather than fixed: firing does not clear the id the class
   * keeps, so a spent timeout still calls itself running, and pausing it works out a
   * remaining time of zero - which the next resume fires straight away. Reactions arms the
   * next signal in an effect right after the phase changes, so a human would have to press
   * pause inside that one render to see it. Recorded in ticket 011 along with the rest of
   * what these three classes get wrong about time.
   */
  test('a spent timeout still calls itself running, and pausing it fires it again', () => {
    // arrange
    const fired: number[] = []
    const timeout = new PausableTimeout(() => fired.push(1), 1000, true)
    vi.advanceTimersByTime(1000)
    // act
    const runningAfterFiring = timeout.isRunning()
    timeout.pause()
    timeout.resume()
    vi.advanceTimersByTime(1)
    // assert - both of these are wrong, and both are what it does today
    expect(runningAfterFiring).toBe(true)
    expect(fired).toHaveLength(2)
  })

  test('starts over from the top when it is restarted', () => {
    // arrange
    const fired: number[] = []
    const timeout = new PausableTimeout(() => fired.push(1), 1000, true)
    vi.advanceTimersByTime(900)
    // act
    timeout.restart()
    vi.advanceTimersByTime(900)
    const early = fired.length
    vi.advanceTimersByTime(100)
    // assert
    expect(early).toBe(0)
    expect(fired).toHaveLength(1)
  })
})
