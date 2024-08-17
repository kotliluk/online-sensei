import { initialState, State } from './state'
import {
  Actions,
  CANCEL_TOURNAMENT,
  INIT_KUMITE_TIMER,
  SET_KUMITE_TIMER,
  SET_KUMITE_TIMER_TOURNAMENT,
  SET_NOT_ACTUAL_KUMITE_TIMER,
  SET_TOURNAMENT_FIGHT,
  SET_TOURNAMENT_STATE,
} from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_KUMITE_TIMER:
      return {
        ...action.payload,
      }

    case SET_KUMITE_TIMER:
      return {
        ...state,
        isActual: true,
        duration: action.payload.duration,
        tournamentFight: null,
      }

    case SET_KUMITE_TIMER_TOURNAMENT:
      return {
        ...state,
        ...action.payload,
      }

    case SET_NOT_ACTUAL_KUMITE_TIMER:
      return {
        ...state,
        isActual: false,
      }

    case CANCEL_TOURNAMENT:
      return {
        ...state,
        activeTournament: false,
      }

    case SET_TOURNAMENT_FIGHT:
      return {
        ...state,
        isActual: true,
        duration: state.tournamentDuration,
        tournamentFight: action.payload.tournamentFight,
      }

    case SET_TOURNAMENT_STATE:
      return {
        ...state,
        isActual: false,
        tournamentFight: null,
        group: action.payload.group,
        tournamentTree: action.payload.tree,
      }

    default:
      return state
  }
}
