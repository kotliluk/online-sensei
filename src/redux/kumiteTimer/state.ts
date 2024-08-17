import { Competitor, Fight, TournamentTreeNode, TournamentType } from '../../types/tournament'


export interface State {
  // actual fight info
  isActual: boolean
  duration: number
  // actual tournament fight info
  tournamentFight: Fight | null
  // tournament info
  activeTournament: boolean
  tournamentName: string
  tournamentType: TournamentType
  tournamentDuration: number
  competitorsCount: number
  competitors: Competitor[]
  tournamentTree: TournamentTreeNode | null
  group: Fight[][]
}

export const initialState: State = {
  isActual: false,
  duration: 120,
  tournamentFight: null,
  activeTournament: false,
  tournamentName: '',
  tournamentType: 'TREE',
  tournamentDuration: 120,
  competitorsCount: 4,
  competitors: [],
  tournamentTree: null,
  group: [],
}
