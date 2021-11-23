export interface State {
  actual: boolean
  count: number
  minSignalDuration: number
  maxSignalDuration: number
  minInterval: number
  maxInterval: number
}

export const initialState: State = {
  actual: false,
  count: 1,
  minSignalDuration: 200,
  maxSignalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
}
