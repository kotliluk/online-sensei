import { RootState } from '../state'


export const selectReactionsIsActual = (state: RootState): boolean => {
  return state.reactions.isActual
}

export const selectReactionsCount = (state: RootState): number => {
  return state.reactions.count
}

export const selectReactionsMinSignalDuration = (state: RootState): number => {
  return state.reactions.minSignalDuration
}

export const selectReactionsMaxSignalDuration = (state: RootState): number => {
  return state.reactions.maxSignalDuration
}

export const selectReactionsMinInterval = (state: RootState): number => {
  return state.reactions.minInterval
}

export const selectReactionsMaxInterval = (state: RootState): number => {
  return state.reactions.maxInterval
}
