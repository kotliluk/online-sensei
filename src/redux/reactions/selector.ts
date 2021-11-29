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

export const selectReactionsSignalCount = (state: RootState): number => {
  return state.reactions.signalCount
}

export const selectReactionsSignalColors = (state: RootState): string[] => {
  return state.reactions.signalColors
}

export const selectReactionsAudioSound = (state: RootState): BeepType => {
  return state.reactions.audioSound
}

export const selectReactionsAudioVolume = (state: RootState): number => {
  return state.reactions.audioVolume
}
