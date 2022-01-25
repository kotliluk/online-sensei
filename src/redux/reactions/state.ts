import { BEEP_A, BeepType } from '../../types/beepType'


export interface State {
  isActual: boolean
  rounds: number
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalCount: number
  signalColors: string[]
  audioSound: BeepType
  audioVolume: number
}

export const initialState: State = {
  isActual: false,
  rounds: 10,
  signalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalCount: 2,
  signalColors: ['#ff0000', '#0000ff', '#35d600', '#ffc800'],
  audioSound: BEEP_A,
  audioVolume: 1,
}
