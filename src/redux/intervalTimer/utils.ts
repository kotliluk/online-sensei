import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import {
  getBooleanFromLS,
  getValidatedNumberFromLS, getValidatedObjectFromLS,
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
  advancedRounds: { min: 1, max: 1000 },
}

export const VALIDATOR: Validator<State> = {
  simpleRounds: isBetweenValidator(LIMITS.simpleRounds),
  simpleWork: isBetweenValidator(LIMITS.simpleWork),
  simplePause: isBetweenValidator(LIMITS.simplePause),

  advancedRoundIntervals: (arr) => arr.every((x) => isValidInterval(x)),
  advancedRounds: isBetweenValidator(LIMITS.advancedRounds),

  isActual: anythingIsValid,
  skipLastPause: anythingIsValid,
  audioSound: isBeepType,
  audioVolume: isBetweenValidator(LIMITS.audioVolume),
  intervals: (arr) => arr.every((x) => isValidInterval(x)),
}

export const LS_KEYS: LSMapper<State> = {
  simpleRounds: 'INTERVAL_TIMER__SIMPLE__ROUNDS',
  simpleWork: 'INTERVAL_TIMER__SIMPLE__WORK',
  simplePause: 'INTERVAL_TIMER__SIMPLE__PAUSE',

  advancedRoundIntervals: 'INTERVAL_TIMER__ADVANCED__ROUND_INTERVALS',
  advancedRounds: 'INTERVAL_TIMER__ADVANCED__ROUNDS',

  skipLastPause: 'INTERVAL_TIMER__SKIP_LAST_PAUSE',
  audioSound: 'INTERVAL_TIMER__AUDIO_SOUND',
  audioVolume: 'INTERVAL_TIMER__AUDIO_VOLUME',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
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

  advancedRoundIntervals: {
    get: () => getValidatedObjectFromLS(
      LS_KEYS.advancedRoundIntervals,
      VALIDATOR.advancedRoundIntervals,
      initialState.advancedRoundIntervals,
    ),
    set: (value) => saveToLS(LS_KEYS.advancedRoundIntervals, JSON.stringify(value)),
  },
  advancedRounds: {
    get: () => getValidatedNumberFromLS(LS_KEYS.advancedRounds, VALIDATOR.advancedRounds, initialState.advancedRounds),
    set: (value) => saveToLS(LS_KEYS.advancedRounds, value),
  },

  isActual: {
    get: () => initialState.isActual,
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
  intervals: {
    get: () => initialState.intervals,
    set: emptyFunc,
  },
}
