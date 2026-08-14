import { initialState, State } from './state'
import { Actions, INIT_REACTIONS, SET_NOT_ACTUAL_REACTIONS, SET_REACTIONS } from './actions'


export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_REACTIONS:
      return {
        ...action.payload,
      }

    case SET_REACTIONS:
      return {
        ...action.payload,
      }

    case SET_NOT_ACTUAL_REACTIONS:
      return {
        ...state,
        isActual: false,
      }

    default:
      return state
  }
}
