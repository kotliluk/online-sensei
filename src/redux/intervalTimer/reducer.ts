import { initialState, State } from './state'
import {
  Actions,
  INIT_INTERVAL_TIMER,
  SET_INTERVAL_TIMER_SIMPLE,
  SET_INTERVAL_TIMER_ADVANCED,
  LOAD_ADVANCED_SERIES,
  SAVE_ADVANCED_SERIES,
  SET_NOT_ACTUAL_INTERVAL_TIMER, DELETE_SAVED_ADVANCED_SERIES,
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

    case SAVE_ADVANCED_SERIES:
      return {
        ...state,
        advancedSavedSeries: state.advancedSavedSeries.concat(action.payload.series),
      }

    case DELETE_SAVED_ADVANCED_SERIES:
      return {
        ...state,
        advancedSavedSeries: state.advancedSavedSeries.filter((_, i) => i !== action.payload.index),
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
