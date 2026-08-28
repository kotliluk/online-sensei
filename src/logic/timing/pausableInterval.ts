/**
 * How many whole intervals of wall time have gone by since the last call. One while the
 * clock simply runs; more when the browser was not there to say so and the intervals have
 * to be accounted for in one go.
 */
export type PausableIntervalCallback = (elapsedIntervals: number) => void

/**
 * Pausable repeating clock that reports the time that passed, not the callbacks it managed
 * to deliver.
 *
 * `setInterval` is not a clock. A tab in the background gets its timers throttled and a
 * phone with the screen off stops running them at all, and neither makes up afterwards what
 * it skipped - so counting callbacks counts less than the time that went by. Measured on a
 * one second block of the event loop, the old implementation reported 900 ms of 2002 ms.
 *
 * Every tick here aims at an absolute moment instead. What arrives late says how much is
 * owed, and the next tick is set against the same grid rather than against the moment the
 * browser happened to get round to this one.
 */
export class PausableInterval {
  private callback: PausableIntervalCallback
  private intervalTime: number
  /** The moment the next tick is due at, on the wall clock. */
  private nextTickAt: number
  /** What was left of the interval in progress when it was paused. */
  private remainingTime: number
  private timeoutId: ReturnType<typeof setTimeout> | undefined
  /**
   * Whether the clock is meant to be running, which is not the same as having a timer
   * pending: inside its own callback it has none. That is exactly where the fight clock
   * stops itself on reaching zero, and reading the pending timer instead is what used to
   * bring it back to life a moment later.
   */
  private running: boolean

  constructor (callback: PausableIntervalCallback, ms: number, start = false) {
    this.callback = callback
    this.intervalTime = ms
    this.nextTickAt = 0
    this.remainingTime = ms
    this.timeoutId = undefined
    this.running = false

    start && this.restart()
  }

  pause (): void {
    if (!this.running) {
      return
    }

    this.running = false
    this.clearPending()
    // what the interval in progress still owes, measured against the clock on the wall
    this.remainingTime = Math.max(0, this.nextTickAt - Date.now())
  }

  resume (): void {
    // An interval of no length is not a clock and has nothing to pick up - the screens hold
    // one of those from their first render until the referee presses start.
    if (this.running || this.intervalTime <= 0) {
      return
    }

    this.running = true
    this.nextTickAt = Date.now() + this.remainingTime
    this.schedule()
  }

  restart (newCallback?: PausableIntervalCallback, newMs?: number): void {
    if (newCallback !== undefined) {
      this.callback = newCallback
    }

    if (newMs !== undefined) {
      this.intervalTime = newMs
    }

    this.clearPending()
    this.running = true
    this.remainingTime = this.intervalTime
    this.nextTickAt = Date.now() + this.intervalTime
    this.schedule()
  }

  private clearPending (): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  private schedule (): void {
    // Never further off than one whole interval, which is all that can honestly be owed.
    // A device clock corrected backwards - a phone picking up the network time, a timezone
    // set by hand - moves the moment being waited for away from the wait, and without this
    // the fight clock would stand still for as long as the correction was. Capped, it goes
    // back to a tick a second, which is the truth about how fast time is passing anyway.
    const wait = Math.min(this.intervalTime, Math.max(0, this.nextTickAt - Date.now()))

    this.timeoutId = setTimeout(() => this.tick(), wait)
  }

  private tick (): void {
    this.timeoutId = undefined

    // The one that was due, plus every whole interval that fits in the delay. Reported in a
    // single call: half a minute in the background is half a minute of the fight, not thirty
    // renders replaying the countdown a second at a time.
    const late = Math.max(0, Date.now() - this.nextTickAt)
    const elapsedIntervals = this.intervalTime > 0
      ? 1 + Math.floor(late / this.intervalTime)
      : 1

    this.nextTickAt += elapsedIntervals * this.intervalTime
    this.callback(elapsedIntervals)

    // The callback is allowed to stop the clock or to start it over, and both of those leave
    // nothing to do here. Setting the next timer regardless is how a clock that had just
    // paused itself came back a moment later.
    if (this.running && this.timeoutId === undefined) {
      this.schedule()
    }
  }
}
