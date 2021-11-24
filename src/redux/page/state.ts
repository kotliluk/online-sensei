export type Theme = 'light' | 'dark'

export interface State {
  theme: Theme
}

export const initialState: State = {
  theme: 'light',
}
