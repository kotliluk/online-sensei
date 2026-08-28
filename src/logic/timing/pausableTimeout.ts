import { Func } from '../../utils/function'


/**
 * Pausable wrapper of JS setTimeout.
 */
export class PausableTimeout {
  private callback: Func
  private timeoutTime: number
  /** The moment it is due to fire at, on the wall clock. */
  private dueAt: number
  /**
   * What was left of it when it was paused, and `undefined` when there is nothing paused to
   * pick up - never armed, or already spent. Firing used to leave the timer id behind
   * instead, so a spent timeout called itself running and the next resume fired it a second
   * time: in Reactions, a signal nobody asked for.
   */
  private remainingTime: number | undefined
  private timeoutId: ReturnType<typeof setTimeout> | undefined

  constructor (callback: Func, ms: number, start = false) {
    this.callback = callback
    this.timeoutTime = ms
    this.dueAt = 0
    this.remainingTime = undefined
    this.timeoutId = undefined

    start && this.restart()
  }

  isRunning (): boolean {
    return this.timeoutId !== undefined
  }

  pause (): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.remainingTime = Math.max(0, this.dueAt - Date.now())
    }
  }

  resume (): void {
    if (this.timeoutId === undefined && this.remainingTime !== undefined) {
      this.arm(this.remainingTime)
    }
  }

  restart (newCallback?: Func, newMs?: number): void {
    if (newCallback !== undefined) {
      this.callback = newCallback
    }

    if (newMs !== undefined) {
      this.timeoutTime = newMs
    }

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId)
    }

    this.arm(this.timeoutTime)
  }

  private arm (ms: number): void {
    this.remainingTime = undefined
    this.dueAt = Date.now() + ms
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined
      this.callback()
    }, ms)
  }
}
