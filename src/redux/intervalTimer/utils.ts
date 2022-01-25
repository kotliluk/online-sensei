import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import {
  getBooleanFromLS,
  getValidatedNumberFromLS,
  getValidatedTypeFromLS,
  saveToLS,
} from '../../logic/localStorage/access'
import { Limits, Validator } from '../../logic/validation/types'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { initialState, State } from './state'
import { isValidInterval } from '../../types/interval'
import { isBeepType } from '../../types/beepType'


export const LIMITS: Limits<State> = {
  simpleRounds: { min: 1, max: 1000 },
  simpleWork: { min: 1, max: 3599 },
  simplePause: { min: 0, max: 3599 },
  audioVolume: { min: 0, max: 1 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  simpleRounds: isBetweenValidator(LIMITS.simpleRounds),
  simpleWork: isBetweenValidator(LIMITS.simpleWork),
  simplePause: isBetweenValidator(LIMITS.simplePause),
  skipLastPause: anythingIsValid,
  audioSound: isBeepType,
  audioVolume: isBetweenValidator(LIMITS.audioVolume),
  intervals: (arr) => arr.every((x) => isValidInterval(x)),
}

export const LS_KEYS: LSMapper<State> = {
  simpleRounds: 'INTERVAL_TIMER__SIMPLE__ROUNDS',
  simpleWork: 'INTERVAL_TIMER__SIMPLE__WORK',
  simplePause: 'INTERVAL_TIMER__SIMPLE__PAUSE',
  skipLastPause: 'INTERVAL_TIMER__SKIP_LAST_PAUSE',
  audioSound: 'INTERVAL_TIMER__AUDIO_SOUND',
  audioVolume: 'INTERVAL_TIMER__AUDIO_VOLUME',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  isActual: {
    get: () => initialState.isActual,
    set: emptyFunc,
  },
  simpleRounds: {
    get: () => getValidatedNumberFromLS(LS_KEYS.simpleRounds, VALIDATOR.simpleRounds, initialState.simpleRounds),
    set: (value) => saveToLS(LS_KEYS.simpleRounds, value),
  },
  simpleWork: {
    get: () => getValidatedNumberFromLS(LS_KEYS.simpleWork, VALIDATOR.simpleWork, initialState.simpleWork),
    set: (value) => saveToLS(LS_KEYS.simpleWork, value),
  },
  simplePause: {
    get: () => getValidatedNumberFromLS(LS_KEYS.simplePause, VALIDATOR.simplePause, initialState.simplePause),
    set: (value) => saveToLS(LS_KEYS.simplePause, value),
  },
  intervals: {
    get: () => initialState.intervals,
    set: emptyFunc,
  },
  skipLastPause: {
    get: () => getBooleanFromLS(LS_KEYS.skipLastPause, initialState.skipLastPause),
    set: (value) => saveToLS(LS_KEYS.skipLastPause, value),
  },
  audioSound: {
    get: () => getValidatedTypeFromLS(LS_KEYS.audioSound, VALIDATOR.audioSound, initialState.audioSound),
    set: (value) => saveToLS(LS_KEYS.audioSound, value),
  },
  audioVolume: {
    get: () => getValidatedNumberFromLS(LS_KEYS.audioVolume, VALIDATOR.audioVolume, initialState.audioVolume),
    set: (value) => saveToLS(LS_KEYS.audioVolume, value),
  },
}
