import { Theme } from '../../types/theme'
import { Translation } from '../../logic/translation/translation'
import { EN } from '../../logic/translation/en'
import { Language } from '../../logic/translation'
import { ModalWindowType } from '../../types/modalWindowType'


export interface State {
  theme: Theme
  language: Language
  translation: Translation
  modalWindow: ModalWindowType
}

export const initialState: State = {
  theme: 'light',
  language: 'EN',
  translation: EN,
  modalWindow: 'NONE',
}
