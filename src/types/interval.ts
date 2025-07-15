import { VALIDATOR } from '../redux/intervalTimer/utils'


export type IntervalType = 'work' | 'pause'

export interface Interval {
  type: IntervalType
  name: string
  duration: number
}

export const isValidIntervalType = (x: any): x is IntervalType => {
  return x === 'work' || x === 'pause'
}

export const isValidInterval = (x: any): x is Interval => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,max-len
  return isValidIntervalType(x.type) && typeof x.name === 'string' && typeof x.duration === 'number' && VALIDATOR.simpleWork(x.duration)
}
