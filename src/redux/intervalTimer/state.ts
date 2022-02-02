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
  advancedSavedSeries: [
    {
      name: '10/20/30',
      rounds: 5,
      intervals: [
        {
          type: 'work',
          name: 'Vyklus',
          duration: 30,
        },
        {
          type: 'work',
          name: 'Beh',
          duration: 20,
        },
        {
          type: 'work',
          name: 'Sprint',
          duration: 10,
        },
      ],
      skipLastPause: false,
      audioSound: BEEP_A,
      audioVolume: 1,
    },
    {
      name: 'Basic',
      rounds: 5,
      intervals: [
        {
          type: 'work',
          name: 'Work',
          duration: 30,
        },
        {
          type: 'pause',
          name: 'Pause',
          duration: 20,
        },
      ],
      skipLastPause: true,
      audioSound: BEEP_A,
      audioVolume: 0.5,
    },
  ],
  advancedLastLoadTime: new Date(),

  isActual: false,
  skipLastPause: true,
  audioSound: BEEP_A,
  audioVolume: 1,
  // initiated to have one valid element
  intervals: [{ type: 'work', name: '', duration: 10 }],
}
