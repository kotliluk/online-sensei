import { Action } from 'redux'
import { AdvancedState, SimpleState, State } from './state'
import { LS_ACCESS } from './utils'
import { Interval } from '../../types/interval'
import { range } from '../../utils/array'
import { BeepType } from '../../types/beepType'


export type Actions = InitIntervalTimer | SetIntervalTimerSimple | SetIntervalTimerAdvanced | SetNotActualIntervalTimer

/** ******************* Init interval timer state from local storage *********************/

export const INIT_INTERVAL_TIMER = 'intervalTimer/INIT_INTERVAL_TIMER'

interface InitIntervalTimer extends Action<typeof INIT_INTERVAL_TIMER> {
  payload: State
}

export const initIntervalTimer = (): InitIntervalTimer => {
  const simpleRounds = LS_ACCESS.simpleRounds.get()
  const simpleWork = LS_ACCESS.simpleWork.get()
  const simplePause = LS_ACCESS.simplePause.get()
  const skipLastPause = LS_ACCESS.skipLastPause.get()

  const advancedRoundIntervals = LS_ACCESS.advancedRoundIntervals.get()
  const advancedRounds = LS_ACCESS.advancedRounds.get()

  const audioSound = LS_ACCESS.audioSound.get()
  const audioVolume = LS_ACCESS.audioVolume.get()
  const intervals = LS_ACCESS.intervals.get()

  return {
    type: INIT_INTERVAL_TIMER,
    payload: {
      simpleRounds,
      simpleWork,
      simplePause,

      advancedRoundIntervals,
      advancedRounds,

      isActual: false,
      skipLastPause,
      audioSound,
      audioVolume,
      intervals,
    },
  }
}

/** ******************* Set interval timer simple state *********************/

export const SET_INTERVAL_TIMER_SIMPLE = 'intervalTimer/SET_INTERVAL_TIMER_SIMPLE'

interface SetIntervalTimerSimple extends Action<typeof SET_INTERVAL_TIMER_SIMPLE> {
  payload: SimpleState
}

export const setIntervalTimerSimple = (
  simpleRounds: number,
  simpleWork: number,
  simplePause: number,
  skipLastPause: boolean,
  audioSound: BeepType,
  audioVolume: number,
): SetIntervalTimerSimple => {
  LS_ACCESS.simpleRounds.set(simpleRounds)
  LS_ACCESS.simpleWork.set(simpleWork)
  LS_ACCESS.simplePause.set(simplePause)
  LS_ACCESS.skipLastPause.set(skipLastPause)
  LS_ACCESS.audioSound.set(audioSound)
  LS_ACCESS.audioVolume.set(audioVolume)

  const intervals: Interval[] = range(simpleRounds).flatMap(() => [
    { type: 'work', name: '', duration: simpleWork } as Interval,
    { type: 'pause', name: '', duration: simplePause } as Interval,
  ]).slice(0, skipLastPause ? -1 : undefined)

  return {
    type: SET_INTERVAL_TIMER_SIMPLE,
    payload: {
      isActual: true,
      simpleRounds,
      simpleWork,
      simplePause,
      intervals,
      skipLastPause,
      audioSound,
      audioVolume,
    },
  }
}

/** ******************* Set interval timer advanced state *********************/

export const SET_INTERVAL_TIMER_ADVANCED = 'intervalTimer/SET_INTERVAL_TIMER_ADVANCED'

interface SetIntervalTimerAdvanced extends Action<typeof SET_INTERVAL_TIMER_ADVANCED> {
  payload: AdvancedState
}

export const setIntervalTimerAdvanced = (
  advancedRoundIntervals: Interval[],
  advancedRounds: number,
  skipLastPause: boolean,
  audioSound: BeepType,
  audioVolume: number,
): SetIntervalTimerAdvanced => {
  LS_ACCESS.advancedRoundIntervals.set(advancedRoundIntervals)
  LS_ACCESS.advancedRounds.set(advancedRounds)
  LS_ACCESS.skipLastPause.set(skipLastPause)
  LS_ACCESS.audioSound.set(audioSound)
  LS_ACCESS.audioVolume.set(audioVolume)

  const intervals: Interval[] = range(advancedRounds)
    .flatMap(() => advancedRoundIntervals)
    .slice(
      0,
      (skipLastPause && advancedRoundIntervals[advancedRoundIntervals.length - 1].type === 'pause') ? -1 : undefined,
    )

  return {
    type: SET_INTERVAL_TIMER_ADVANCED,
    payload: {
      advancedRoundIntervals,
      advancedRounds,

      isActual: true,
      skipLastPause,
      audioSound,
      audioVolume,
      intervals,
    },
  }
}


/** ******************* Set interval timer as not actual *********************/

export const SET_NOT_ACTUAL_INTERVAL_TIMER = 'intervalTimer/SET_NOT_ACTUAL_INTERVAL_TIMER'

interface SetNotActualIntervalTimer extends Action<typeof SET_NOT_ACTUAL_INTERVAL_TIMER> {
  payload: { }
}

export const setNotActualIntervalTimer = (): SetNotActualIntervalTimer => {
  return {
    type: SET_NOT_ACTUAL_INTERVAL_TIMER,
    payload: { },
  }
}
