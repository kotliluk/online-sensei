import { initialState, State } from './state'
import { Actions, INIT_KUMITE_TIMER, SET_KUMITE_TIMER, SET_NOT_ACTUAL_KUMITE_TIMER } from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_KUMITE_TIMER:
      return {
        ...action.payload,
      }

    case SET_KUMITE_TIMER:
      return {
        ...action.payload,
      }

    case SET_NOT_ACTUAL_KUMITE_TIMER:
      return {
        ...state,
        isActual: false,
      }

    default:
      return state
  }
}
