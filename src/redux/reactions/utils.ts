import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import {
  getValidatedNumberFromLS, getValidatedObjectFromLS, getValidatedStringFromLS, saveToLS,
} from '../../logic/localStorage/access'
import { Limits, Validator } from '../../logic/validation/types'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { isHexColor } from '../../types/color'
import { isBeepType } from '../../types/beepType'
import { initialState, State } from './state'


export const LIMITS: Limits<State> = {
  rounds: { min: 1, max: 10000 },
  signalDuration: { min: 50, max: 10000 },
  minInterval: { min: 100, max: 100000 },
  maxInterval: { min: 100, max: 100000 },
  signalCount: { min: 1, max: 4 },
  audioVolume: { min: 0, max: 1 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  rounds: isBetweenValidator(LIMITS.rounds),
  signalDuration: isBetweenValidator(LIMITS.signalDuration),
  minInterval: isBetweenValidator(LIMITS.minInterval),
  maxInterval: isBetweenValidator(LIMITS.maxInterval),
  signalCount: isBetweenValidator(LIMITS.signalCount),
  signalColors: (arr) => {
    return Array.isArray(arr)
      && arr.length === LIMITS.signalCount.max
      && arr.every(isHexColor)
  },
  audioSound: isBeepType,
  audioVolume: isBetweenValidator(LIMITS.audioVolume),
}

export const LS_KEYS: LSMapper<State> = {
  rounds: 'REACTIONS__ROUNDS',
  signalDuration: 'REACTIONS__SIGNAL_DURATION',
  minInterval: 'REACTIONS__MIN_INTERVAL',
  maxInterval: 'REACTIONS__MAX_INTERVAL',
  signalCount: 'REACTIONS__SIGNAL_COUNT',
  signalColors: 'REACTIONS__SIGNAL_COLORS',
  audioSound: 'REACTIONS__AUDIO_SOUND',
  audioVolume: 'REACTIONS__AUDIO_VOLUME',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  isActual: {
    get: () => initialState.isActual,
    set: emptyFunc,
  },
  rounds: {
    get: () => getValidatedNumberFromLS(LS_KEYS.rounds, VALIDATOR.rounds, initialState.rounds),
    set: (value) => saveToLS(LS_KEYS.rounds, value),
  },
  signalDuration: {
    get: () => getValidatedNumberFromLS(LS_KEYS.signalDuration, VALIDATOR.signalDuration, initialState.signalDuration),
    set: (value) => saveToLS(LS_KEYS.signalDuration, value),
  },
  minInterval: {
    get: () => getValidatedNumberFromLS(LS_KEYS.minInterval, VALIDATOR.minInterval, initialState.minInterval),
    set: (value) => saveToLS(LS_KEYS.minInterval, value),
  },
  maxInterval: {
    get: () => getValidatedNumberFromLS(LS_KEYS.maxInterval, VALIDATOR.maxInterval, initialState.maxInterval),
    set: (value) => saveToLS(LS_KEYS.maxInterval, value),
  },
  signalCount: {
    get: () => getValidatedNumberFromLS(LS_KEYS.signalCount, VALIDATOR.signalCount, initialState.signalCount),
    set: (value) => saveToLS(LS_KEYS.signalCount, value),
  },
  signalColors: {
    get: () => getValidatedObjectFromLS(LS_KEYS.signalColors, VALIDATOR.signalColors, initialState.signalColors),
    set: (value) => saveToLS(LS_KEYS.signalColors, JSON.stringify(value)),
  },
  audioSound: {
    get: () => getValidatedStringFromLS(LS_KEYS.audioSound, VALIDATOR.audioSound, initialState.audioSound),
    set: (value) => saveToLS(LS_KEYS.audioSound, value),
  },
  audioVolume: {
    get: () => getValidatedNumberFromLS(LS_KEYS.audioVolume, VALIDATOR.audioVolume, initialState.audioVolume),
    set: (value) => saveToLS(LS_KEYS.audioVolume, value),
  },
}
