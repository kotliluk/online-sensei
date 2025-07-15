import { Interval, isValidInterval } from './interval'
import { BeepType } from './beepType'
import { VALIDATOR } from '../redux/intervalTimer/utils'


export type Series = {
  name: string,
  intervals: Interval[],
  rounds: number,
  skipLastPause: boolean,
  audioSound: BeepType,
  audioVolume: number,
}

export const isValidSeries = (x: any): x is Series => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof x.name === 'string'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    && Array.isArray(x.intervals) && (x.intervals.every((i: any) => isValidInterval(i)) as boolean)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && typeof x.rounds === 'number' && VALIDATOR.advancedRounds(x.rounds)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && typeof x.skipLastPause === 'boolean'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && VALIDATOR.audioSound(x.audioSound)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && typeof x.audioVolume === 'number' && VALIDATOR.audioVolume(x.audioVolume)
}
