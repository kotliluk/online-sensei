import { Action } from 'redux'
import { State } from './state'
import { LS_ACCESS } from './utils'


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

  return {
    type: INIT_INTERVAL_TIMER,
    payload: {
      isActual: false,
      simpleRounds,
      simpleWork,
      simplePause,
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
): SetIntervalTimer => {
  LS_ACCESS.simpleRounds.set(simpleRounds)
  LS_ACCESS.simpleWork.set(simpleWork)
  LS_ACCESS.simplePause.set(simplePause)

  return {
    type: SET_INTERVAL_TIMER,
    payload: {
      isActual: true,
      simpleRounds,
      simpleWork,
      simplePause,
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
