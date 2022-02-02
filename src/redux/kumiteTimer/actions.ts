import { Action } from 'redux'
import { LS_ACCESS } from './utils'
import { State } from './state'


export type Actions = InitKumiteTimer | SetKumiteTimer | SetNotActualKumiteTimer

/** ******************* Init kumite timer state *********************/

export const INIT_KUMITE_TIMER = 'kumiteTimer/INIT_KUMITE_TIMER'

interface InitKumiteTimer extends Action<typeof INIT_KUMITE_TIMER> {
  payload: State
}

export const initKumiteTimer = (): InitKumiteTimer => {
  const duration = LS_ACCESS.duration.get()
  const atoshibaraku = LS_ACCESS.atoshibaraku.get()

  return {
    type: INIT_KUMITE_TIMER,
    payload: {
      isActual: false,
      duration,
      atoshibaraku,
    },
  }
}

/** ******************* Set kumite timer state *********************/

export const SET_KUMITE_TIMER = 'kumiteTimer/SET_KUMITE_TIMER'

interface SetKumiteTimer extends Action<typeof SET_KUMITE_TIMER> {
  payload: State
}

export const setKumiteTimer = (duration: number, atoshibaraku: number): SetKumiteTimer => {
  LS_ACCESS.duration.set(duration)
  LS_ACCESS.atoshibaraku.set(atoshibaraku)

  return {
    type: SET_KUMITE_TIMER,
    payload: {
      isActual: true,
      duration,
      atoshibaraku,
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

