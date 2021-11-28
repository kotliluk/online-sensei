import { BeepType, NO_BEEP } from '../../types/beepType'


export interface State {
  isActual: boolean
  rounds: number
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
  audio: BeepType
}

export const initialState: State = {
  isActual: false,
  rounds: 10,
  signalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalColor: '#ff0000',
  audio: NO_BEEP,
}
