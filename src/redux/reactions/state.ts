export interface State {
  isActual: boolean
  rounds: number
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
}

export const initialState: State = {
  isActual: false,
  rounds: 1,
  signalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalColor: '#ff0000',
}
