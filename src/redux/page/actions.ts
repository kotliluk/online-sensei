import { Action } from 'redux'
import { Theme } from './state'
import { getValidatedStringFromLS, saveToLS } from '../../logic/localStorage'
import { initialState } from './state'


export type Actions = InitPage | SetTheme

const LS_KEYS = {
  THEME: 'PAGE__THEME',
} as const

/** ******************* Init page state *********************/

export const INIT_PAGE = 'page/SET_THEME'

interface InitPage extends Action<typeof INIT_PAGE> {
  payload: {
    theme: Theme,
  }
}

export const initPage = (): InitPage => {
  const theme = getValidatedStringFromLS(LS_KEYS.THEME, (str) => str === 'light' || str === 'dark', initialState.theme)

  return {
    type: INIT_PAGE,
    payload: {
      theme: theme as Theme,
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
  saveToLS(LS_KEYS.THEME, theme)

  return {
    type: SET_THEME,
    payload: {
      theme,
    },
  }
}
