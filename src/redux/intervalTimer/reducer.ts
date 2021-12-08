import { initialState, State } from './state'
import { Actions, INIT_INTERVAL_TIMER, SET_INTERVAL_TIMER, SET_NOT_ACTUAL_INTERVAL_TIMER } from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_INTERVAL_TIMER:
      return {
        ...action.payload,
      }

    case SET_INTERVAL_TIMER:
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
