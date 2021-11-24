import { Action } from 'redux'
import { Theme } from './state'


export type Actions = SetTheme

/** ******************* Set reactions state *********************/

export const SET_THEME = 'reactions/SET_THEME'

interface SetTheme extends Action<typeof SET_THEME> {
  payload: {
    theme: Theme,
  }
}

export const setTheme = (theme: Theme): SetTheme => {
  return {
    type: SET_THEME,
    payload: {
      theme,
    },
  }
}
