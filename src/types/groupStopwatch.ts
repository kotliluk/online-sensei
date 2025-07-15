import { getContrastColor, isHexColor, THexColor } from './color'


export interface CompetitorSetup {
  name: string
  color: THexColor
}

export const newCompetitorSetup = (name = '', color = '#f99c3c'): CompetitorSetup => ({
  name,
  color,
})

export const isValidCompetitorSetup = (x: any): x is CompetitorSetup => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.name === 'string') && (typeof x.color === 'string') && isHexColor(x.color)
}

export interface Competitor {
  id: number
  name: string
  color: THexColor
  contrastColor: THexColor
  time: number | null
  timeString: string
  lastClick: number
}

export const newCompetitor = (id: number, name: string, color: THexColor): Competitor => ({
  id,
  name,
  color,
  contrastColor: getContrastColor(color),
  time: null,
  timeString: '--.--',
  lastClick: 0,
})

export interface CompetitorWithPlace {
  id: number
  name: string
  color: THexColor
  contrastColor: THexColor
  time: number
  timeString: string
  place: number
}

export const newCompetitorWithPlace = (
  { id, name, color, contrastColor, time, timeString }: Competitor,
  place: number,
  nullTimeReplace: number,
): CompetitorWithPlace => ({
  id,
  name,
  color,
  contrastColor,
  time: time === null ? nullTimeReplace : time,
  timeString,
  place,
})
