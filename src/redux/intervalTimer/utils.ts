import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import { getValidatedNumberFromLS, saveToLS } from '../../logic/localStorage/access'
import { Limits, Validator } from '../../logic/validation/types'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { initialState, State } from './state'
import { isValidInterval } from '../../types/interval'


export const LIMITS: Limits<State> = {
  simpleRounds: { min: 1, max: 1000 },
  simpleWork: { min: 1, max: 3599 },
  simplePause: { min: 0, max: 3599 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  simpleRounds: isBetweenValidator(LIMITS.simpleRounds),
  simpleWork: isBetweenValidator(LIMITS.simpleWork),
  simplePause: isBetweenValidator(LIMITS.simplePause),
  intervals: (arr) => arr.every((x) => isValidInterval(x)),
}

export const LS_KEYS: LSMapper<State> = {
  simpleRounds: 'INTERVAL_TIMER__SIMPLE__ROUNDS',
  simpleWork: 'INTERVAL_TIMER__SIMPLE__WORK',
  simplePause: 'INTERVAL_TIMER__SIMPLE__PAUSE',
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
}
