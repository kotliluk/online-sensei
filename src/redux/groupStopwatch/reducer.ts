import { initialState, State } from './state'
import {
  Actions,
  INIT_GROUP_STOPWATCH,
  SET_GROUP_STOPWATCH,
  SET_NOT_ACTUAL_GROUP_STOPWATCH,
} from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_GROUP_STOPWATCH:
      return {
        ...action.payload,
      }

    case SET_GROUP_STOPWATCH:
      return {
        ...state,
        ...action.payload,
      }

    case SET_NOT_ACTUAL_GROUP_STOPWATCH:
      return {
        ...state,
        isActual: false,
      }

    default:
      return state
  }
}
