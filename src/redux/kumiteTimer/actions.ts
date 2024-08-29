import { Action } from 'redux'
import { LS_ACCESS } from './utils'
import { initialState, State } from './state'
import {
  Competitor,
  createGroup,
  createTournamentTree,
  Fight,
  FightResult,
  TournamentTreeNode,
  TournamentType,
  updateGroupTable,
  updateRepechageTree,
  updateTournamentTree,
} from '../../types/tournament'
import { ThunkAction } from '../thunk'


export type Actions = InitKumiteTimer | SetKumiteTimer | SetKumiteTimerTournament | SetNotActualKumiteTimer
| CancelTournament | SetTournamentFight | SetTournamentState

/** ******************* Init kumite timer state *********************/

export const INIT_KUMITE_TIMER = 'kumiteTimer/INIT_KUMITE_TIMER'

interface InitKumiteTimer extends Action<typeof INIT_KUMITE_TIMER> {
  payload: State
}

export const initKumiteTimer = (): InitKumiteTimer => {
  const duration = LS_ACCESS.duration.get()
  const activeTournament = LS_ACCESS.activeTournament.get()
  const tournamentName = LS_ACCESS.tournamentName.get()
  const tournamentType = LS_ACCESS.tournamentType.get()
  const competitorsCount = LS_ACCESS.competitorsCount.get()
  const competitors = LS_ACCESS.competitors.get()
  const tournamentTree = LS_ACCESS.tournamentTree.get()
  const tournamentTreeRepechage = LS_ACCESS.repechageTree.get()
  const tournamentDuration = LS_ACCESS.tournamentDuration.get()
  const group = LS_ACCESS.group.get()

  return {
    type: INIT_KUMITE_TIMER,
    payload: {
      isActual: false,
      duration,
      tournamentFight: null,
      activeTournament,
      tournamentName,
      tournamentType,
      competitorsCount,
      competitors,
      tournamentTree,
      tournamentDuration,
      repechageTree: tournamentTreeRepechage,
      group,
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

export const setKumiteTimer = (
  duration: number,
): SetKumiteTimer => {
  LS_ACCESS.duration.set(duration)

  return {
    type: SET_KUMITE_TIMER,
    payload: {
      duration,
    },
  }
}

/** ******************* Set kumite timer tournament state *********************/

export const SET_KUMITE_TIMER_TOURNAMENT = 'kumiteTimer/SET_KUMITE_TIMER_TOURNAMENT'

interface SetKumiteTimerTournament extends Action<typeof SET_KUMITE_TIMER_TOURNAMENT> {
  payload: State
}

export const setKumiteTimerTournament = (
  duration: number,
  tournamentName: string,
  tournamentType: TournamentType,
  competitorsCount: number,
  competitors: Competitor[],
): SetKumiteTimerTournament => {
  let tournamentTree = null
  let group: Fight[][] = []

  if (tournamentType === 'TREE') {
    tournamentTree = createTournamentTree(competitors, 0)
  } else {
    group = createGroup(competitors)
  }
  LS_ACCESS.duration.set(duration)
  LS_ACCESS.activeTournament.set(true)
  LS_ACCESS.tournamentName.set(tournamentName)
  LS_ACCESS.tournamentType.set(tournamentType)
  LS_ACCESS.competitorsCount.set(competitorsCount)
  LS_ACCESS.competitors.set(competitors)
  LS_ACCESS.tournamentTree.set(tournamentTree)
  LS_ACCESS.repechageTree.set(null)
  LS_ACCESS.tournamentDuration.set(duration)
  LS_ACCESS.group.set(group)

  return {
    type: SET_KUMITE_TIMER_TOURNAMENT,
    payload: {
      isActual: false,
      duration,
      tournamentFight: null,
      activeTournament: true,
      tournamentName,
      tournamentType,
      competitorsCount,
      competitors,
      tournamentTree,
      repechageTree: null,
      tournamentDuration: duration,
      group,
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

/** ******************* Cancels tournament *********************/

export const CANCEL_TOURNAMENT = 'kumiteTimer/CANCEL_TOURNAMENT'

interface CancelTournament extends Action<typeof CANCEL_TOURNAMENT> {
  payload: { }
}

export const cancelTournament = (): CancelTournament => {
  LS_ACCESS.activeTournament.set(false)
  LS_ACCESS.tournamentFight.set(initialState.tournamentFight)
  LS_ACCESS.competitorsCount.set(initialState.competitorsCount)
  LS_ACCESS.competitors.set(initialState.competitors)
  LS_ACCESS.tournamentTree.set(initialState.tournamentTree)
  LS_ACCESS.group.set(initialState.group)

  return {
    type: CANCEL_TOURNAMENT,
    payload: { },
  }
}

/** ******************* Set tournament fight *********************/

export const SET_TOURNAMENT_FIGHT = 'kumiteTimer/SET_TOURNAMENT_FIGHT'

interface SetTournamentFight extends Action<typeof SET_TOURNAMENT_FIGHT> {
  payload: {
    tournamentFight: Fight | null,
  }
}

export const setTournamentFight = (tournamentFight: Fight | null): SetTournamentFight => {
  return {
    type: SET_TOURNAMENT_FIGHT,
    payload: {
      tournamentFight,
    },
  }
}

/** ******************* Set tournament state *********************/

export const SET_TOURNAMENT_STATE = 'kumiteTimer/SET_TOURNAMENT_STATE'

interface SetTournamentState extends Action<typeof SET_TOURNAMENT_STATE> {
  payload: {
    group: Fight[][],
    tree: TournamentTreeNode | null,
    repechage: TournamentTreeNode | null,
  }
}

export const setTournamentState = (
  group: Fight[][],
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null,
): SetTournamentState => {
  LS_ACCESS.group.set(group)
  LS_ACCESS.tournamentTree.set(tree)
  LS_ACCESS.repechageTree.set(repechage)

  return {
    type: SET_TOURNAMENT_STATE,
    payload: {
      group,
      tree,
      repechage,
    },
  }
}

/** ******************* Save tournament fight thunk action *********************/

export const saveTournamentFight = (result: FightResult): ThunkAction => (dispatch, getState) => {
  const tournamentType = getState().kumiteTimer.tournamentType
  const curGroup = getState().kumiteTimer.group
  const curTree = getState().kumiteTimer.tournamentTree
  const curRepechage = getState().kumiteTimer.repechageTree

  const group = tournamentType === 'GROUP' ? updateGroupTable(curGroup, result) : []
  const tournamentTree = tournamentType === 'TREE' ? updateTournamentTree(curTree, result) : null
  const repechageTree = tournamentType === 'TREE' ? updateRepechageTree(tournamentTree, curRepechage, result) : null

  dispatch(setTournamentState(group, tournamentTree, repechageTree))
}

