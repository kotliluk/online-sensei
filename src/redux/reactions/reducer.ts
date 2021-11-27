import { initialState, State } from './state'
import { Actions, INIT_REACTIONS, SET_NOT_ACTUAL_REACTIONS, SET_REACTIONS } from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_REACTIONS:
    case SET_REACTIONS:
      return {
        ...state,
        isActual: action.type === SET_REACTIONS,
        rounds: action.payload.rounds,
        signalDuration: action.payload.signalDuration,
        minInterval: action.payload.minInterval,
        maxInterval: action.payload.maxInterval,
        signalColor: action.payload.signalColor,
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
