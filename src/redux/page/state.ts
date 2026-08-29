import { Theme } from '../../types/theme'
import { Translation } from '../../logic/translation/translation'
import { EN } from '../../logic/translation/en'
import { Language } from '../../logic/translation'
import { ModalWindowType } from '../../types/modalWindowType'
import { LeaveQuestion } from '../../types/leaveQuestion'


export interface State {
  theme: Theme
  language: Language
  translation: Translation
  modalWindow: ModalWindowType
  /** Set by whichever screen is showing, and only while it has something to lose. */
  leaveQuestion: LeaveQuestion | null
}

export const initialState: State = {
  theme: 'light',
  language: 'EN',
  translation: EN,
  modalWindow: 'NONE',
  leaveQuestion: null,
}
