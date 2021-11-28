import { RootState } from '../state'
import { Theme } from '../../types/theme'


export const selectTheme = (state: RootState): Theme => {
  return state.page.theme
}
