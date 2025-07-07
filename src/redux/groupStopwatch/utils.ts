import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { emptyFunc } from '../../utils/function'
import {
  getBooleanFromLS, getValidatedNumberFromLS, getValidatedObjectFromLS, saveToLS,
} from '../../logic/localStorage/access'
import { Limits, Validator } from '../../logic/validation/types'
import { anythingIsValid, isBetweenValidator } from '../../logic/validation/validators'
import { initialState, State } from './state'


export const LIMITS: Limits<State> = {
  competitorsCount: { min: 2, max: 50 },
}

export const VALIDATOR: Validator<State> = {
  competitorsCount: isBetweenValidator(LIMITS.competitorsCount),
  competitors: anythingIsValid,
  startTogether: anythingIsValid,

  isActual: anythingIsValid,
}

export const LS_KEYS: LSMapper<State> = {
  competitorsCount: 'GROUP_STOPWATCH__COMPETITORS_COUNT',
  competitors: 'GROUP_STOPWATCH__COMPETITORS',
  startTogether: 'GROUP_STOPWATCH__START_TOGETHER',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  competitorsCount: {
    get: () => getValidatedNumberFromLS(
      LS_KEYS.competitorsCount,
      VALIDATOR.competitorsCount,
      initialState.competitorsCount,
    ),
    set: (value) => saveToLS(LS_KEYS.competitorsCount, JSON.stringify(value)),
  },
  competitors: {
    get: () => getValidatedObjectFromLS(LS_KEYS.competitors, VALIDATOR.competitors, initialState.competitors),
    set: (value) => saveToLS(LS_KEYS.competitors, JSON.stringify(value)),
  },
  startTogether: {
    get: () => getBooleanFromLS(LS_KEYS.startTogether, initialState.startTogether),
    set: (value) => saveToLS(LS_KEYS.startTogether, JSON.stringify(value)),
  },

  isActual: {
    get: () => initialState.isActual,
    set: emptyFunc,
  },
}
