import { Validator } from '../../logic/validation/types'
import { isThemeType } from '../../types/theme'
import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import { getValidatedTypeFromLS, saveToLS } from '../../logic/localStorage/access'
import { initialState, State } from './state'
import { anythingIsValid } from '../../logic/validation/validators'
import { isValidLanguage } from '../../logic/translation'
import { emptyFunc } from '../../utils/function'


export const VALIDATOR: Validator<State> = {
  theme: isThemeType,
  language: isValidLanguage,
  translation: anythingIsValid,
}

export const LS_KEYS: LSMapper<State> = {
  theme: 'PAGE__THEME',
  language: 'PAGE__LANG',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  theme: {
    get: () => getValidatedTypeFromLS(LS_KEYS.theme, VALIDATOR.theme, initialState.theme),
    set: (value) => saveToLS(LS_KEYS.theme, value),
  },
  language: {
    get: () => getValidatedTypeFromLS(LS_KEYS.language, VALIDATOR.language, initialState.language),
    set: (value) => saveToLS(LS_KEYS.language, value),
  },
  translation: {
    get: () => initialState.translation,
    set: emptyFunc,
  },
}
