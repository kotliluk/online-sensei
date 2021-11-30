import { Func } from '../../utils/function'


/**
 * Pausable wrapper of JS setInterval.
 */
export class PausableInterval {
  private callback: Func
  private intervalTime: number
  private remainingTime: number
  private timeoutId: NodeJS.Timeout | undefined
  private intervalId: NodeJS.Timeout | undefined
  private lastStart: number

  constructor (callback: Func, ms: number, start = false) {
    this.callback = callback
    this.intervalTime = ms
    this.remainingTime = ms
    this.timeoutId = undefined
    this.intervalId = undefined
    this.lastStart = 0

    start && this.restart()
  }

  isRunning (): boolean {
    return this.intervalId !== undefined
  }

  isPaused (): boolean {
    return this.intervalId === undefined
  }

  pause (): void {
    if ((this.intervalId !== undefined) || (this.timeoutId !== undefined)) {
      this.intervalId !== undefined && clearInterval(this.intervalId)
      this.timeoutId !== undefined && clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.intervalId = undefined
      const now = new Date().getTime()
      const elapsed = now - this.lastStart
      this.remainingTime -= elapsed
    }
  }

  resume (): void {
    if ((this.intervalId === undefined) && (this.timeoutId === undefined)) {
      // sets timeout only to fill remaining time => after that, sets interval in callback
      this.timeoutId = setTimeout(() => {
        this.callback()
        this.restart()
      }, Math.max(this.remainingTime, 0))
      this.lastStart = new Date().getTime()
    }
  }

  restart (newCallback?: Func, newMs?: number): void {
    if (newCallback !== undefined) {
      this.callback = newCallback
    }

    if (newMs !== undefined) {
      this.intervalTime = newMs
    }

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId)
    }

    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId)
    }

    this.remainingTime = this.intervalTime
    this.intervalId = setInterval(() => {
      this.callback()
      this.lastStart = new Date().getTime()
    }, this.intervalTime)
    this.lastStart = new Date().getTime()
  }
}
