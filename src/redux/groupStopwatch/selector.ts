import { RootState } from '../state'


export const selectGroupStopwatchCompetitorsCount = (state: RootState): number => {
  return state.groupStopwatch.competitorsCount
}

export const selectGroupStopwatchCompetitors = (state: RootState): string[] => {
  return state.groupStopwatch.competitors
}

export const selectGroupStopwatchIsActual = (state: RootState): boolean => {
  return state.groupStopwatch.isActual
}
