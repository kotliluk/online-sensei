import { initialState, State } from './state'
import {
  Actions,
  SET_REACTIONS,
  RESET_REACTIONS,
} from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case SET_REACTIONS:
      return {
        ...state,
        isActual: true,
        count: action.payload.count,
        minSignalDuration: action.payload.minSignalDuration,
        maxSignalDuration: action.payload.maxSignalDuration,
        minInterval: action.payload.minInterval,
        maxInterval: action.payload.maxInterval,
      }

    case RESET_REACTIONS:
      return {
        ...state,
        isActual: false,
      }

    default:
      return state
  }
}
