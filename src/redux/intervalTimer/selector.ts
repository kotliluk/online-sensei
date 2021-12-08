import { RootState } from '../state'
import { Interval } from '../../types/interval'


export const selectIntervalTimerIsActual = (state: RootState): boolean => {
  return state.intervalTimer.isActual
}

export const selectIntervalTimerIntervals = (state: RootState): Interval[] => {
  return state.intervalTimer.intervals
}

export const selectIntervalTimerSimpleRounds = (state: RootState): number => {
  return state.intervalTimer.simpleRounds
}

export const selectIntervalTimerSimpleWork = (state: RootState): number => {
  return state.intervalTimer.simpleWork
}

export const selectIntervalTimerSimplePause = (state: RootState): number => {
  return state.intervalTimer.simplePause
}
