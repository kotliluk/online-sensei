import { Action } from 'redux'
import { State } from './state'
import { LS_ACCESS } from './utils'


export type Actions = InitGroupStopwatch
| SetGroupStopwatch
| SetNotActualGroupStopwatch

/** ******************* Init group stopwatch state from local storage *********************/

export const INIT_GROUP_STOPWATCH = 'groupStopwatch/INIT_GROUP_STOPWATCH'

interface InitGroupStopwatch extends Action<typeof INIT_GROUP_STOPWATCH> {
  payload: State
}

export const initGroupStopwatch = (): InitGroupStopwatch => {
  const competitorsCount = LS_ACCESS.competitorsCount.get()
  const competitors = LS_ACCESS.competitors.get()
  const startTogether = LS_ACCESS.startTogether.get()

  return {
    type: INIT_GROUP_STOPWATCH,
    payload: {
      competitorsCount,
      competitors,
      startTogether,

      isActual: false,
    },
  }
}

/** ******************* Set groups stopwatch state *********************/

export const SET_GROUP_STOPWATCH = 'groupStopwatch/SET_GROUP_STOPWATCH'

interface SetGroupStopwatch extends Action<typeof SET_GROUP_STOPWATCH> {
  payload: State
}

export const setGroupStopwatch = (
  competitorsCount: number,
  competitors: string[],
  startTogether: boolean,
): SetGroupStopwatch => {
  LS_ACCESS.competitorsCount.set(competitorsCount)
  LS_ACCESS.competitors.set(competitors)
  LS_ACCESS.startTogether.set(startTogether)

  return {
    type: SET_GROUP_STOPWATCH,
    payload: {
      isActual: true,
      competitorsCount,
      competitors,
      startTogether,
    },
  }
}

/** ******************* Set groups stopwatch as not actual *********************/

export const SET_NOT_ACTUAL_GROUP_STOPWATCH = 'groupStopwatch/SET_NOT_ACTUAL_GROUP_STOPWATCH'

interface SetNotActualGroupStopwatch extends Action<typeof SET_NOT_ACTUAL_GROUP_STOPWATCH> {
  payload: { }
}

export const setNotActualGroupStopwatch = (): SetNotActualGroupStopwatch => {
  return {
    type: SET_NOT_ACTUAL_GROUP_STOPWATCH,
    payload: { },
  }
}
