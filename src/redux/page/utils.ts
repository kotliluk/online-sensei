import { Validator } from '../../logic/validation/types'
import { isThemeType } from '../../types/theme'
import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { getValidatedTypeFromLS, saveToLS } from '../../logic/localStorage/access'
import { initialState, State } from './state'


export const VALIDATOR: Validator<State> = {
  theme: isThemeType,
}

export const LS_KEYS: LSMapper<State> = {
  theme: 'PAGE__THEME',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  theme: {
    get: () => getValidatedTypeFromLS(LS_KEYS.theme, VALIDATOR.theme, initialState.theme),
    set: (value) => saveToLS(LS_KEYS.theme, value),
  },
}
