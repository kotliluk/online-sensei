import { Action } from 'redux'
import {
  getNumberFromLSOrDefault,
  getStringFromLSOrDefault, saveToLS,
} from '../../logic/localStorage'
import { initialState } from './state'


export type Actions = InitReactions | SetReactions | SetNotActualReactions

const LS_KEYS = {
  ROUNDS: 'REACTIONS__ROUNDS',
  SIGNAL_DURATION: 'REACTIONS__SIGNAL_DURATION',
  MIN_INTERVAL: 'REACTIONS__MIN_INTERVAL',
  MAX_INTERVAL: 'REACTIONS__MAX_INTERVAL',
  SIGNAL_COLOR: 'REACTIONS__SIGNAL_COLOR',
} as const

/** ******************* Init reactions state from local storage *********************/

export const INIT_REACTIONS = 'reactions/INIT_REACTIONS'

interface InitReactions extends Action<typeof INIT_REACTIONS> {
  payload: {
    rounds: number,
    signalDuration: number,
    minInterval: number,
    maxInterval: number,
    signalColor: string,
  }
}

export const initReactions = (): InitReactions => {
  const rounds = getNumberFromLSOrDefault(LS_KEYS.ROUNDS, initialState.rounds)
  const signalDuration = getNumberFromLSOrDefault(LS_KEYS.SIGNAL_DURATION, initialState.signalDuration)
  const minInterval = getNumberFromLSOrDefault(LS_KEYS.MIN_INTERVAL, initialState.minInterval)
  const maxInterval = getNumberFromLSOrDefault(LS_KEYS.MAX_INTERVAL, initialState.maxInterval)
  const signalColor = getStringFromLSOrDefault(LS_KEYS.SIGNAL_COLOR, initialState.signalColor)

  return {
    type: INIT_REACTIONS,
    payload: {
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalColor,
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
  }
}

export const setReactions = (
  rounds: number,
  signalDuration: number,
  minInterval: number,
  maxInterval: number,
  signalColor: string,
): SetReactions => {
  saveToLS(LS_KEYS.ROUNDS, rounds)
  saveToLS(LS_KEYS.SIGNAL_DURATION, signalDuration)
  saveToLS(LS_KEYS.MIN_INTERVAL, minInterval)
  saveToLS(LS_KEYS.MAX_INTERVAL, maxInterval)
  saveToLS(LS_KEYS.SIGNAL_COLOR, signalColor)

  return {
    type: SET_REACTIONS,
    payload: {
      rounds,
      signalDuration,
      minInterval,
      maxInterval,
      signalColor,
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
