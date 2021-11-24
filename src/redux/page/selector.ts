import { RootState } from '../state'
import { Theme } from './state'


export const selectTheme = (state: RootState): Theme => {
  return state.page.theme
}
