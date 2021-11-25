import { Action } from 'redux'


export type Actions = SetReactions | ResetReactions

/** ******************* Set reactions state *********************/

export const SET_REACTIONS = 'reactions/SET_REACTIONS'

interface SetReactions extends Action<typeof SET_REACTIONS> {
  payload: {
    rounds: number,
    minSignalDuration: number,
    maxSignalDuration: number,
    minInterval: number,
    maxInterval: number,
    signalColor: string,
  }
}

export const setReactions = (
  rounds: number,
  minSignalDuration: number,
  maxSignalDuration: number,
  minInterval: number,
  maxInterval: number,
  signalColor: string,
): SetReactions => {
  return {
    type: SET_REACTIONS,
    payload: {
      rounds,
      minSignalDuration,
      maxSignalDuration,
      minInterval,
      maxInterval,
      signalColor,
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
