export interface Competitor {
  id: number
  name: string
  time: number | null
  timeString: string
  lastClick: number
}

export const newCompetitor = (id: number, name: string): Competitor => ({
  id,
  name,
  time: null,
  timeString: '--.--',
  lastClick: 0,
})

export interface CompetitorWithPlace {
  id: number
  name: string
  time: number
  timeString: string
  place: number
}

export const newCompetitorWithPlace = (
  { id, name, time, timeString }: Competitor,
  place: number,
  nullTimeReplace: number,
): CompetitorWithPlace => ({
  id,
  name,
  time: time === null ? nullTimeReplace : time,
  timeString,
  place,
})
