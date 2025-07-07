export type State = {
  // set up
  competitorsCount: number,
  competitors: string[],
  startTogether: boolean,
  // common
  isActual: boolean,
}

export const initialState: State = {
  competitorsCount: 4,
  competitors: ['', '', '', ''],
  startTogether: true,

  isActual: false,
}
