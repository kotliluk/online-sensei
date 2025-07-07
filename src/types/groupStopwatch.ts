export interface Competitor {
  id: number
  name: string
  time: number | null
  timeString: string | null
  lastClick: number
}

export const newCompetitor = (id: number, name: string): Competitor => ({
  id,
  name,
  time: null,
  timeString: '--.--',
  lastClick: 0,
})
