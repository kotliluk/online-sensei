import { RootState } from '../state'
import { Theme } from '../../types/theme'
import { Translation } from '../../logic/translation/translation'
import { Language } from '../../logic/translation'


export const selectTheme = (state: RootState): Theme => {
  return state.page.theme
}

export const selectLanguage = (state: RootState): Language => {
  return state.page.language
}

export const selectTranslation = (state: RootState): Translation => {
  return state.page.translation
}
