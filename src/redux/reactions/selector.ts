import { RootState } from '../state'


export const selectReactionsIsActual = (state: RootState): boolean => {
  return state.reactions.isActual
}

export const selectReactionsRounds = (state: RootState): number => {
  return state.reactions.rounds
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

export const selectReactionsSignalColor = (state: RootState): string => {
  return state.reactions.signalColor
}
