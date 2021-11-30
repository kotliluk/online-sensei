import { Action } from 'redux'
import { LS_ACCESS } from './utils'


export type Actions = InitKumiteTimer | SetKumiteTimer | SetNotActualKumiteTimer

/** ******************* Init kumite timer state *********************/

export const INIT_KUMITE_TIMER = 'kumiteTimer/INIT_KUMITE_TIMER'

interface InitKumiteTimer extends Action<typeof INIT_KUMITE_TIMER> {
  payload: {
    isActual: boolean,
    duration: number,
  }
}

export const initKumiteTimer = (): InitKumiteTimer => {
  const duration = LS_ACCESS.duration.get()

  return {
    type: INIT_KUMITE_TIMER,
    payload: {
      isActual: false,
      duration,
    },
  }
}

/** ******************* Set kumite timer state *********************/

export const SET_KUMITE_TIMER = 'kumiteTimer/SET_KUMITE_TIMER'

interface SetKumiteTimer extends Action<typeof SET_KUMITE_TIMER> {
  payload: {
    duration: number,
  }
}

export const setKumiteTimer = (duration: number): SetKumiteTimer => {
  LS_ACCESS.duration.set(duration)

  return {
    type: SET_KUMITE_TIMER,
    payload: {
      duration,
    },
  }
}

/** ******************* Set kumite timer as not actual *********************/

export const SET_NOT_ACTUAL_KUMITE_TIMER = 'kumiteTimer/SET_NOT_ACTUAL_KUMITE_TIMER'

interface SetNotActualKumiteTimer extends Action<typeof SET_NOT_ACTUAL_KUMITE_TIMER> {
  payload: { }
}

export const setNotActualKumiteTimer = (): SetNotActualKumiteTimer => {
  return {
    type: SET_NOT_ACTUAL_KUMITE_TIMER,
    payload: { },
  }
}

