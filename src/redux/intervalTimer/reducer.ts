import { initialState, State } from './state'
import {
  Actions,
  INIT_INTERVAL_TIMER,
  LOAD_ADVANCED_SERIES,
  SET_INTERVAL_TIMER_SIMPLE,
  SET_INTERVAL_TIMER_ADVANCED,
  SET_NOT_ACTUAL_INTERVAL_TIMER,
} from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_INTERVAL_TIMER:
      return {
        ...action.payload,
      }

    case SET_INTERVAL_TIMER_SIMPLE:
      return {
        ...state,
        ...action.payload,
      }

    case SET_INTERVAL_TIMER_ADVANCED:
      return {
        ...state,
        ...action.payload,
      }

    case LOAD_ADVANCED_SERIES:
      return {
        ...state,
        ...action.payload,
      }

    case SET_NOT_ACTUAL_INTERVAL_TIMER:
      return {
        ...state,
        isActual: false,
      }

    default:
      return state
  }
}
