export type IntervalType = 'work' | 'pause'

export interface Interval {
  type: IntervalType
  name: string
  duration: number
}

export const isValidIntervalType = (x: any): boolean => {
  return x === 'work' || x === 'pause'
}

export const isValidInterval = (x: any): boolean => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return isValidInterval(x.type) && typeof x.name === 'string' && typeof x.duration === 'number' && x.duration >= 0
}
