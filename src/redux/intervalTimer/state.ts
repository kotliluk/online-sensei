import { Interval } from '../../types/interval'
import { BEEP_A, BeepType } from '../../types/beepType'
import { Series } from '../../types/series'


export type State = {
  // simple set up
  simpleRounds: number,
  simpleWork: number,
  simplePause: number,
  // advanced set up
  advancedRoundIntervals: Interval[],
  advancedRounds: number,
  advancedSavedSeries: Series[],
  advancedLastLoadTime: Date,
  // common
  isActual: boolean,
  skipLastPause: boolean,
  audioSound: BeepType,
  audioVolume: number,
  intervals: Interval[],
}

export type CommonState = Pick<State, 'isActual' | 'skipLastPause' | 'audioSound' | 'audioVolume' | 'intervals'>

export type SimpleState = Pick<State, 'simpleRounds' | 'simpleWork' | 'simplePause'> & CommonState

export type AdvancedState = Pick<State, 'advancedRoundIntervals' | 'advancedRounds'> & CommonState

export const initialState: State = {
  simpleRounds: 10,
  simpleWork: 30,
  simplePause: 10,

  advancedRoundIntervals: [
    { type: 'work', name: 'Work A', duration: 15 },
    { type: 'work', name: 'Work B', duration: 10 },
    { type: 'pause', name: 'Pause', duration: 5 },
  ],
  advancedRounds: 5,
  advancedSavedSeries: [],
  advancedLastLoadTime: new Date(),

  isActual: false,
  skipLastPause: true,
  audioSound: BEEP_A,
  audioVolume: 1,
  // initiated to have one valid element
  intervals: [{ type: 'work', name: '', duration: 10 }],
}
