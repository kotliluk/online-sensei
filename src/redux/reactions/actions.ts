import { Action } from 'redux'
import { State } from './state'
import { BeepType } from '../../types/beepType'
import { LS_ACCESS } from './utils'


export type Actions = InitReactions | SetReactions | SetNotActualReactions

/** ******************* Init reactions state from local storage *********************/

export const INIT_REACTIONS = 'reactions/INIT_REACTIONS'

interface InitReactions extends Action<typeof INIT_REACTIONS> {
  payload: State
}

export const initReactions = (): InitReactions => {
  const rounds = LS_ACCESS.rounds.get()
  const signalDuration = LS_ACCESS.signalDuration.get()
  const minInterval = LS_ACCESS.minInterval.get()
  const maxInterval = LS_ACCESS.maxInterval.get()
  const signalCount = LS_ACCESS.signalCount.get()
  const signalColors = LS_ACCESS.signalColors.get()
  const audioSound = LS_ACCESS.audioSound.get()
  const audioVolume = LS_ACCESS.audioVolume.get()

  return {
    type: INIT_REACTIONS,
    payload: {
      isActual: false,
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalCount,
      signalColors,
      audioSound,
      audioVolume,
    },
  }
}

/** ******************* Set reactions state *********************/

export const SET_REACTIONS = 'reactions/SET_REACTIONS'

interface SetReactions extends Action<typeof SET_REACTIONS> {
  payload: State
}

export const setReactions = (
  rounds: number,
  signalDuration: number,
  minInterval: number,
  maxInterval: number,
  signalCount: number,
  signalColors: string[],
  audioSound: BeepType,
  audioVolume: number,
): SetReactions => {
  LS_ACCESS.rounds.set(rounds)
  LS_ACCESS.signalDuration.set(signalDuration)
  LS_ACCESS.minInterval.set(minInterval)
  LS_ACCESS.maxInterval.set(maxInterval)
  LS_ACCESS.signalCount.set(signalCount)
  LS_ACCESS.signalColors.set(signalColors)
  LS_ACCESS.audioSound.set(audioSound)
  LS_ACCESS.audioVolume.set(audioVolume)

  return {
    type: SET_REACTIONS,
    payload: {
      isActual: true,
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalCount,
      signalColors,
      audioSound,
      audioVolume,
    },
  }
}

/** ******************* Set reactions as not actual *********************/

export const SET_NOT_ACTUAL_REACTIONS = 'reactions/SET_NOT_ACTUAL_REACTIONS'

interface SetNotActualReactions extends Action<typeof SET_NOT_ACTUAL_REACTIONS> {
  payload: { }
}

export const setNotActualReactions = (): SetNotActualReactions => {
  return {
    type: SET_NOT_ACTUAL_REACTIONS,
    payload: { },
  }
}
