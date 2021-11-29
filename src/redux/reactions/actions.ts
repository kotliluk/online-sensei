import { Action } from 'redux'
import {
  getValidatedNumberFromLS,
  getValidatedStringFromLS,
  getValidatedTypeFromLS,
  saveToLS,
} from '../../logic/localStorage/access'
import { initialState } from './state'
import { BeepType } from '../../types/beepType'
import { LS_KEYS, VALIDATOR } from './utils'


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
    signalColor: string,
    audioSound: BeepType,
    audioVolume: number,
  }
}

export const initReactions = (): InitReactions => {
  const rounds = getValidatedNumberFromLS(LS_KEYS.rounds, VALIDATOR.rounds, initialState.rounds)
  const signalDuration = getValidatedNumberFromLS(
    LS_KEYS.signalDuration, VALIDATOR.signalDuration, initialState.signalDuration,
  )
  const minInterval = getValidatedNumberFromLS(LS_KEYS.minInterval, VALIDATOR.minInterval, initialState.minInterval)
  const maxInterval = getValidatedNumberFromLS(LS_KEYS.maxInterval, VALIDATOR.maxInterval, initialState.maxInterval)
  const signalColor = getValidatedStringFromLS(LS_KEYS.signalColor, VALIDATOR.signalColor, initialState.signalColor)
  const audioSound = getValidatedTypeFromLS(LS_KEYS.audioSound, VALIDATOR.audioSound, initialState.audioSound)
  const audioVolume = getValidatedNumberFromLS(LS_KEYS.audioVolume, VALIDATOR.audioVolume, initialState.audioVolume)

  return {
    type: INIT_REACTIONS,
    payload: {
      isActual: false,
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalColor,
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
    signalColor: string,
    audioSound: BeepType,
    audioVolume: number,
  }
}

export const setReactions = (
  rounds: number,
  signalDuration: number,
  minInterval: number,
  maxInterval: number,
  signalColor: string,
  audioSound: BeepType,
  audioVolume: number,
): SetReactions => {
  saveToLS(LS_KEYS.rounds, rounds)
  saveToLS(LS_KEYS.signalDuration, signalDuration)
  saveToLS(LS_KEYS.minInterval, minInterval)
  saveToLS(LS_KEYS.maxInterval, maxInterval)
  saveToLS(LS_KEYS.signalColor, signalColor)
  saveToLS(LS_KEYS.audioSound, audioSound)
  saveToLS(LS_KEYS.audioVolume, audioVolume)

  return {
    type: SET_REACTIONS,
    payload: {
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalColor,
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
