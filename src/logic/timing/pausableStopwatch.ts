export type PausableStopwatchCallback = (elapsedMs: number, wasPaused: boolean) => void

/**
 * Pausable wrapper of JS setInterval.
 */
export class PausableStopwatch {
  private callback: PausableStopwatchCallback
  private callbackInterval: number
  private intervalId: ReturnType<typeof setInterval> | undefined
  private lastStart: number
  private elapsedBefore: number

  constructor (callback: PausableStopwatchCallback, ms: number, start = false) {
    this.callback = callback
    this.callbackInterval = ms
    this.intervalId = undefined
    this.lastStart = 0
    this.elapsedBefore = 0

    start && this.restart()
  }

  isRunning (): boolean {
    return this.intervalId !== undefined
  }

  pause (): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      const now = Date.now()
      this.elapsedBefore += now - this.lastStart
      this.callback(this.elapsedBefore, true)
    }
  }

  resume (): void {
    this.restart()
  }

  restart (newCallback?: PausableStopwatchCallback, newMs?: number): void {
    if (newCallback !== undefined) {
      this.callback = newCallback
    }

    if (newMs !== undefined) {
      this.callbackInterval = newMs
    }

    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => {
      const now = Date.now()
      const elapsedNow = now - this.lastStart
      this.callback(this.elapsedBefore + elapsedNow, false)
    }, this.callbackInterval)
    this.lastStart = Date.now()
  }

  stop (): void {
    this.pause()
    this.elapsedBefore = 0
    this.lastStart = 0
  }
}
