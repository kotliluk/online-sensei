import { BeepType, NO_BEEP } from '../../types/beepType'


export interface State {
  isActual: boolean
  rounds: number
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
  audioSound: BeepType
  audioVolume: number
}

export const initialState: State = {
  isActual: false,
  rounds: 10,
  signalDuration: 200,
  minInterval: 2000,
  maxInterval: 4000,
  signalColor: '#ff0000',
  audioSound: NO_BEEP,
  audioVolume: 1,
}
