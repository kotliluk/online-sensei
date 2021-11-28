import { Theme } from '../../types/theme'


export interface State {
  theme: Theme
}

export const initialState: State = {
  theme: 'light',
}
