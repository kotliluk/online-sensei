import { initialState, State } from './state'
import { Actions, SET_THEME } from './actions'


// eslint-disable-next-line @typescript-eslint/default-param-last
export function reducer (state = initialState, action: Actions): State {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        theme: action.payload.theme,
      }

    default:
      return state
  }
}
