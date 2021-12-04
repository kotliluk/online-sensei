export interface State {
  isActual: boolean
  duration: number
  atoshibaraku: number
}

export const initialState: State = {
  isActual: false,
  duration: 120,
  atoshibaraku: 30,
}
