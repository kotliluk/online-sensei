export interface State {
  isActual: boolean
  simpleRounds: number
  simpleWork: number
  simplePause: number
}

export const initialState: State = {
  isActual: false,
  simpleRounds: 10,
  simpleWork: 30,
  simplePause: 10,
}
