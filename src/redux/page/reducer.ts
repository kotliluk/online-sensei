import { initialState, State } from './state'
import {
  Actions,
  INIT_PAGE,
  SET_LEAVE_QUESTION,
  SET_MODAL_WINDOW,
  SET_THEME,
  SET_TRANSLATION,
} from './actions'


export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_PAGE:
      return {
        ...action.payload,
      }

    case SET_THEME:
    case SET_TRANSLATION:
    case SET_MODAL_WINDOW:
    case SET_LEAVE_QUESTION:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}
