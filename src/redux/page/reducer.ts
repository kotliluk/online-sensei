import { initialState, State } from './state'
import { Actions, INIT_PAGE, SET_MODAL_WINDOW, SET_THEME, SET_TRANSLATION } from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case INIT_PAGE:
      return {
        ...action.payload,
      }

    case SET_THEME:
      return {
        ...state,
        ...action.payload,
      }

    case SET_TRANSLATION:
      return {
        ...state,
        ...action.payload,
      }

    case SET_MODAL_WINDOW:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}
