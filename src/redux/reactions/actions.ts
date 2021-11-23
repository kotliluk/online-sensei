import { Action } from 'redux'


export type Actions = SetReactions | ResetReactions

/** ******************* Set reactions state *********************/

export const SET_REACTIONS = 'reactions/SET_REACTIONS'

interface SetReactions extends Action<typeof SET_REACTIONS> {
  payload: {
    count: number,
    minSignalDuration: number,
    maxSignalDuration: number,
    minInterval: number,
    maxInterval: number,
  }
}

export const setReactions = (
  count: number,
  minSignalDuration: number,
  maxSignalDuration: number,
  minInterval: number,
  maxInterval: number,
): SetReactions => {
  return {
    type: SET_REACTIONS,
    payload: {
      count,
      minSignalDuration,
      maxSignalDuration,
      minInterval,
      maxInterval,
    },
  }
}

/** ******************* Reset reactions state *********************/

export const RESET_REACTIONS = 'reactions/RESET_REACTIONS'

interface ResetReactions extends Action<typeof RESET_REACTIONS> {
  payload: { }
}

export const resetReactions = (): ResetReactions => {
  return {
    type: RESET_REACTIONS,
    payload: { },
  }
}
