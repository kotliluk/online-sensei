import { CompetitorSetup, newCompetitorSetup } from '../../types/groupStopwatch'


export type State = {
  // set up
  competitorsCount: number,
  competitors: CompetitorSetup[],
  // common
  isActual: boolean,
}

export const initialState: State = {
  competitorsCount: 4,
  competitors: [
    newCompetitorSetup(),
    newCompetitorSetup(),
    newCompetitorSetup(),
    newCompetitorSetup(),
  ],

  isActual: false,
}
