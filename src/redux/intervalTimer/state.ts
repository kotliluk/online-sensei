import { Interval } from '../../types/interval'
import { BEEP_A, BeepType } from '../../types/beepType'


export interface State {
  isActual: boolean
  simpleRounds: number
  simpleWork: number
  simplePause: number
  skipLastPause: boolean
  audioSound: BeepType
  audioVolume: number
  intervals: Interval[]
}

export const initialState: State = {
  isActual: false,
  simpleRounds: 10,
  simpleWork: 30,
  simplePause: 10,
  skipLastPause: true,
  audioSound: BEEP_A,
  audioVolume: 1,
  // initiated to have one valid element
  intervals: [{ type: 'work', name: '', duration: 10 }],
}
