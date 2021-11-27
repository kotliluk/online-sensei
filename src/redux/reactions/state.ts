import { isBetweenValidator } from '../../logic/validation'


export interface State {
  isActual: boolean
  rounds: number
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
}

export const LIMITS = {
  ROUNDS: { MIN: 1, MAX: 10000 },
  SIGNAL: { MIN: 10, MAX: 10000 },
  INTERVAL: { MIN: 100, MAX: 100000 },
}

export const VALIDATORS = {
  ROUNDS: isBetweenValidator(LIMITS.ROUNDS.MIN, LIMITS.ROUNDS.MAX),
  SIGNAL: isBetweenValidator(LIMITS.SIGNAL.MIN, LIMITS.SIGNAL.MAX),
  INTERVAL: isBetweenValidator(LIMITS.INTERVAL.MIN, LIMITS.INTERVAL.MAX),
}

export const initialState: State = {
  isActual: false,
  rounds: 10,
  signalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalColor: '#ff0000',
}
