import { Action } from 'redux'
import { State } from './state'
import { LS_ACCESS } from './utils'
import { Interval } from '../../types/interval'
import { range } from '../../utils/array'
import { BeepType } from '../../types/beepType'


export type Actions = InitIntervalTimer | SetIntervalTimer | SetNotActualIntervalTimer

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
  const audioSound = LS_ACCESS.audioSound.get()
  const audioVolume = LS_ACCESS.audioVolume.get()
  const intervals = LS_ACCESS.intervals.get()

  return {
    type: INIT_INTERVAL_TIMER,
    payload: {
      isActual: false,
      simpleRounds,
      simpleWork,
      simplePause,
      skipLastPause,
      audioSound,
      audioVolume,
      intervals,
    },
  }
}

/** ******************* Set interval timer state *********************/

export const SET_INTERVAL_TIMER = 'intervalTimer/SET_INTERVAL_TIMER'

interface SetIntervalTimer extends Action<typeof SET_INTERVAL_TIMER> {
  payload: State
}

export const setIntervalTimer = (
  simpleRounds: number,
  simpleWork: number,
  simplePause: number,
  skipLastPause: boolean,
  audioSound: BeepType,
  audioVolume: number,
): SetIntervalTimer => {
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
    type: SET_INTERVAL_TIMER,
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
