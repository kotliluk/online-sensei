export type State = {
  // set up
  competitorsCount: number,
  competitors: string[],
  // common
  isActual: boolean,
}

export const initialState: State = {
  competitorsCount: 4,
  competitors: ['', '', '', ''],

  isActual: false,
}
