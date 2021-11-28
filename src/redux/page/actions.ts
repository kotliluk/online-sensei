import { Action } from 'redux'
import { Theme } from '../../types/theme'
import { LS_ACCESS } from './utils'


export type Actions = InitPage | SetTheme

/** ******************* Init page state *********************/

export const INIT_PAGE = 'page/SET_THEME'

interface InitPage extends Action<typeof INIT_PAGE> {
  payload: {
    theme: Theme,
  }
}

export const initPage = (): InitPage => {
  const theme = LS_ACCESS.theme.get()

  return {
    type: INIT_PAGE,
    payload: {
      theme: theme,
    },
  }
}

/** ******************* Set theme state *********************/

export const SET_THEME = 'page/SET_THEME'

interface SetTheme extends Action<typeof SET_THEME> {
  payload: {
    theme: Theme,
  }
}

export const setTheme = (theme: Theme): SetTheme => {
  LS_ACCESS.theme.set(theme)

  return {
    type: SET_THEME,
    payload: {
      theme,
    },
  }
}
