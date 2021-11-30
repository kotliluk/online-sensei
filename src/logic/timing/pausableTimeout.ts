import { Func } from '../../utils/function'


/**
 * Pausable wrapper of JS setTimeout.
 */
export class PausableTimeout {
  private callback: Func
  private timeoutTime: number
  private remainingTime: number
  private timeoutId: NodeJS.Timeout | undefined
  private lastStart: number

  constructor (callback: Func, ms: number, start = false) {
    this.callback = callback
    this.timeoutTime = ms
    this.remainingTime = ms
    this.timeoutId = undefined
    this.lastStart = 0

    start && this.restart()
  }

  isRunning (): boolean {
    return this.timeoutId !== undefined
  }

  isPaused (): boolean {
    return this.timeoutId === undefined
  }

  pause (): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      const now = new Date().getTime()
      const elapsed = now - this.lastStart
      this.remainingTime -= elapsed
    }
  }

  resume (): void {
    if (this.timeoutId === undefined) {
      this.timeoutId = setTimeout(this.callback, this.remainingTime)
      this.lastStart = new Date().getTime()
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

    this.remainingTime = this.timeoutTime
    this.timeoutId = setTimeout(this.callback, this.timeoutTime)
    this.lastStart = new Date().getTime()
  }
}
