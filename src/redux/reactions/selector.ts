import { RootState } from '../state'
import { BeepType } from '../../types/beepType'


export const selectReactionsIsActual = (state: RootState): boolean => {
  return state.reactions.isActual
}

export const selectReactionsRounds = (state: RootState): number => {
  return state.reactions.rounds
}

export const selectReactionsSignalDuration = (state: RootState): number => {
  return state.reactions.signalDuration
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

export const selectReactionsAudio = (state: RootState): BeepType => {
  return state.reactions.audio
}
