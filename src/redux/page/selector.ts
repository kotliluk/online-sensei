import { RootState } from '../state'
import { Theme } from '../../types/theme'
import { Translation } from '../../logic/translation/translation'
import { ModalWindowType } from '../../types/modalWindowType'
import { LeaveQuestion } from '../../types/leaveQuestion'


export const selectTheme = (state: RootState): Theme => {
  return state.page.theme
}

export const selectTranslation = (state: RootState): Translation => {
  return state.page.translation
}

export const selectModalWindowType = (state: RootState): ModalWindowType => {
  return state.page.modalWindow
}

export const selectLeaveQuestion = (state: RootState): LeaveQuestion | null => {
  return state.page.leaveQuestion
}
