import { initialState, State } from './state'
import { Actions, INIT_PAGE, SET_THEME } from './actions'


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
        theme: action.payload.theme,
      }

    default:
      return state
  }
}
