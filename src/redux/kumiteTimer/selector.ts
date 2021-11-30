import { RootState } from '../state'


export const selectKumiteTimerIsActual = (state: RootState): boolean => {
  return state.kumiteTimer.isActual
}

export const selectKumiteTimerDuration = (state: RootState): number => {
  return state.kumiteTimer.duration
}
