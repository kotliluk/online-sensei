import { Interval } from '../../types/interval'


export interface State {
  isActual: boolean
  simpleRounds: number
  simpleWork: number
  simplePause: number
  intervals: Interval[]
}

export const initialState: State = {
  isActual: false,
  simpleRounds: 10,
  simpleWork: 30,
  simplePause: 10,
  // initiated to have one valid element
  intervals: [{ type: 'work', name: '', duration: 10 }],
}
