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
  competitors: ['1', '2', '3', '4'],
  startTogether: true,

  isActual: false,
}
