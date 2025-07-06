export type State = {
  // set up
  activityName: string,
  competitorsCount: number,
  competitors: string[],
  startTogether: boolean,
  // common
  isActual: boolean,
}

export const initialState: State = {
  activityName: '',
  competitorsCount: 4,
  competitors: ['1', '2', '3', '4'],
  startTogether: true,

  isActual: false,
}
