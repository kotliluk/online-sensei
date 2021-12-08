import { RootState } from '../state'


export const selectIntervalTimerIsActual = (state: RootState): boolean => {
  return state.intervalTimer.isActual
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
