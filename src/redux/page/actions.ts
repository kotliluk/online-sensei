import { Action } from 'redux'
import { Theme } from '../../types/theme'
import { LS_ACCESS } from './utils'
import { getTranslation, Language } from '../../logic/translation'
import { Translation } from '../../logic/translation/translation'


export type Actions = InitPage | SetTheme | SetTranslation

/** ******************* Init page state *********************/

export const INIT_PAGE = 'page/INIT_PAGE'

interface InitPage extends Action<typeof INIT_PAGE> {
  payload: {
    theme: Theme,
    language: Language,
    translation: Translation,
  }
}

export const initPage = (): InitPage => {
  const theme = LS_ACCESS.theme.get()
  const language = LS_ACCESS.language.get()
  const translation = getTranslation(language)

  return {
    type: INIT_PAGE,
    payload: {
      theme,
      language,
      translation,
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

/** ******************* Set language *********************/

export const SET_TRANSLATION = 'page/SET_TRANSLATION'

interface SetTranslation extends Action<typeof SET_TRANSLATION> {
  payload: {
    language: Language,
    translation: Translation,
  }
}

export const setTranslation = (language: Language): SetTranslation => {
  LS_ACCESS.language.set(language)
  const translation = getTranslation(language)

  return {
    type: SET_TRANSLATION,
    payload: {
      language,
      translation,
    },
  }
}
