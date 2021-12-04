import { Limits, Validator } from '../../logic/validation/types'
import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { getValidatedNumberFromLS, saveToLS } from '../../logic/localStorage/access'
import { initialState, State } from './state'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { emptyFunc } from '../../utils/function'


export const LIMITS: Limits<State> = {
  duration: { min: 30, max: 300 },
  atoshibaraku: { min: 5, max: 60 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  duration: isBetweenValidator(LIMITS.duration),
  atoshibaraku: isBetweenValidator(LIMITS.atoshibaraku),
}

export const LS_KEYS: LSMapper<State> = {
  duration: 'KUMITE_TIMER__DURATION',
  atoshibaraku: 'KUMITE_TIMER__ATOSHIBARAKU',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  isActual: {
    get: () => initialState.isActual,
    set: emptyFunc,
  },
  duration: {
    get: () => getValidatedNumberFromLS(LS_KEYS.duration, VALIDATOR.duration, initialState.duration),
    set: (value) => saveToLS(LS_KEYS.duration, value),
  },
  atoshibaraku: {
    get: () => getValidatedNumberFromLS(LS_KEYS.atoshibaraku, VALIDATOR.atoshibaraku, initialState.atoshibaraku),
    set: (value) => saveToLS(LS_KEYS.atoshibaraku, value),
  },
}
