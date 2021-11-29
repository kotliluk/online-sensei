import { Action } from 'redux'
import { getValidatedNumberFromLS } from '../../logic/localStorage/access'
import { initialState } from './state'
import { BeepType } from '../../types/beepType'
import { LS_ACCESS, LS_KEYS, VALIDATOR } from './utils'


export type Actions = InitReactions | SetReactions | SetNotActualReactions

/** ******************* Init reactions state from local storage *********************/

export const INIT_REACTIONS = 'reactions/INIT_REACTIONS'

interface InitReactions extends Action<typeof INIT_REACTIONS> {
  payload: {
    isActual: boolean,
    rounds: number,
    signalDuration: number,
    minInterval: number,
    maxInterval: number,
    signalCount: number,
    signalColors: string[],
    audioSound: BeepType,
    audioVolume: number,
  }
}

export const initReactions = (): InitReactions => {
  const rounds = getValidatedNumberFromLS(LS_KEYS.rounds, VALIDATOR.rounds, initialState.rounds)
  const signalDuration = getValidatedNumberFromLS(
    LS_KEYS.signalDuration, VALIDATOR.signalDuration, initialState.signalDuration,
  )
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
  payload: {
    rounds: number,
    signalDuration: number,
    minInterval: number,
    maxInterval: number,
    signalCount: number,
    signalColors: string[],
    audioSound: BeepType,
    audioVolume: number,
  }
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
