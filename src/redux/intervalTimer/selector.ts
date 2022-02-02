import { RootState } from '../state'
import { Interval } from '../../types/interval'
import { BeepType } from '../../types/beepType'
import { Series } from '../../types/series'


// simple

export const selectIntervalTimerSimpleRounds = (state: RootState): number => {
  return state.intervalTimer.simpleRounds
}

export const selectIntervalTimerSimpleWork = (state: RootState): number => {
  return state.intervalTimer.simpleWork
}

export const selectIntervalTimerSimplePause = (state: RootState): number => {
  return state.intervalTimer.simplePause
}

// advanced

export const selectIntervalTimerAdvancedRoundIntervals = (state: RootState): Interval[] => {
  return state.intervalTimer.advancedRoundIntervals
}

export const selectIntervalTimerAdvancedRounds = (state: RootState): number => {
  return state.intervalTimer.advancedRounds
}

export const selectIntervalTimerAdvancedSavedSeries = (state: RootState): Series[] => {
  return state.intervalTimer.advancedSavedSeries
}

export const selectIntervalTimerAdvancedLastLoadTime = (state: RootState): Date => {
  return state.intervalTimer.advancedLastLoadTime
}

// common

export const selectIntervalTimerIsActual = (state: RootState): boolean => {
  return state.intervalTimer.isActual
}

export const selectIntervalTimerAudioSound = (state: RootState): BeepType => {
  return state.intervalTimer.audioSound
}

export const selectIntervalTimerAudioVolume = (state: RootState): number => {
  return state.intervalTimer.audioVolume
}

export const selectIntervalTimerSkipLastPause = (state: RootState): boolean => {
  return state.intervalTimer.skipLastPause
}

export const selectIntervalTimerIntervals = (state: RootState): Interval[] => {
  return state.intervalTimer.intervals
}
