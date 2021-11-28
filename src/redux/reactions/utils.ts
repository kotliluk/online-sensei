import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import {
  getValidatedNumberFromLS,
  getValidatedStringFromLS,
  getValidatedTypeFromLS,
  saveToLS,
} from '../../logic/localStorage/access'
import { Limits, Validator } from '../../logic/validation/types'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { isHexColor } from '../../utils/color'
import { isBeepType } from '../../types/beepType'
import { initialState, State } from './state'


export const LIMITS: Limits<State> = {
  rounds: { min: 1, max: 10000 },
  signalDuration: { min: 50, max: 10000 },
  minInterval: { min: 100, max: 100000 },
  maxInterval: { min: 100, max: 100000 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  rounds: isBetweenValidator(LIMITS.rounds),
  signalDuration: isBetweenValidator(LIMITS.signalDuration),
  minInterval: isBetweenValidator(LIMITS.minInterval),
  maxInterval: isBetweenValidator(LIMITS.maxInterval),
  signalColor: isHexColor,
  audio: isBeepType,
}

export const LS_KEYS: LSMapper<State> = {
  rounds: 'REACTIONS__ROUNDS',
  signalDuration: 'REACTIONS__SIGNAL_DURATION',
  minInterval: 'REACTIONS__MIN_INTERVAL',
  maxInterval: 'REACTIONS__MAX_INTERVAL',
  signalColor: 'REACTIONS__SIGNAL_COLOR',
  audio: 'REACTIONS__AUDIO',
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
  signalColor: {
    get: () => getValidatedStringFromLS(LS_KEYS.signalColor, VALIDATOR.signalColor, initialState.signalColor),
    set: (value) => saveToLS(LS_KEYS.signalColor, value),
  },
  audio: {
    get: () => getValidatedTypeFromLS(LS_KEYS.audio, VALIDATOR.audio, initialState.audio),
    set: (value) => saveToLS(LS_KEYS.audio, value),
  },
}
