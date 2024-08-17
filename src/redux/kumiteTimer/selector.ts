import { RootState } from '../state'
import { Competitor, Fight, TournamentType } from '../../types/tournament'


export const selectKumiteTimerIsActual = (state: RootState): boolean => {
  return state.kumiteTimer.isActual
}

export const selectKumiteTimerDuration = (state: RootState): number => {
  return state.kumiteTimer.duration
}

export const selectKumiteTimerTournamentFight = (state: RootState): Fight | null => {
  return state.kumiteTimer.tournamentFight
}

export const selectKumiteTimerIsTournament = (state: RootState): boolean => {
  return state.kumiteTimer.activeTournament
}

export const selectKumiteTimerTournamentName = (state: RootState): string => {
  return state.kumiteTimer.tournamentName
}

export const selectKumiteTimerTournamentType = (state: RootState): TournamentType => {
  return state.kumiteTimer.tournamentType
}

export const selectKumiteTimerCompetitorsCount = (state: RootState): number => {
  return state.kumiteTimer.competitorsCount
}

export const selectKumiteTimerCompetitors = (state: RootState): Competitor[] => {
  return state.kumiteTimer.competitors
}

export const selectKumiteTimerTournamentGroup = (state: RootState): Fight[][] => {
  return state.kumiteTimer.group
}
