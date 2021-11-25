export interface State {
  isActual: boolean
  rounds: number
  minSignalDuration: number
  maxSignalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
}

export const initialState: State = {
  isActual: false,
  rounds: 1,
  minSignalDuration: 200,
  maxSignalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalColor: '#ff0000',
}
