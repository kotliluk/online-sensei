import { Theme } from '../../types/theme'
import { Translation } from '../../logic/translation/translation'
import { EN } from '../../logic/translation/en'
import { Language } from '../../logic/translation'


export interface State {
  theme: Theme
  language: Language
  translation: Translation
}

export const initialState: State = {
  theme: 'light',
  language: 'EN',
  translation: EN,
}
