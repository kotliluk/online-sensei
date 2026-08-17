import { LeadingTimeUnit, parseMinTime } from '../utils/time'
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

/**
 * The same competitor with their saved time moved by `deltaMs`.
 *
 * A time gets saved by tapping a card, which happens under pressure and lands a second
 * early or late often enough to be worth correcting afterwards. There is no upper bound
 * on purpose - the number is a written down measurement, not a reading of the clock, so
 * it may legitimately end up past whatever the clock says now. Zero is a bound, because
 * a negative time would sort ahead of everybody who actually ran.
 */
export const shiftCompetitorTime = (
  competitor: Competitor,
  deltaMs: number,
  leadingUnit: LeadingTimeUnit,
): Competitor => {
  if (competitor.time === null) {
    return competitor
  }

  const time = Math.max(0, competitor.time + deltaMs)

  return { ...competitor, time, timeString: parseMinTime(time / 1000, 2, leadingUnit) }
}

/** The same competitor back in the state of not having finished yet. */
export const clearCompetitorTime = (competitor: Competitor, leadingUnit: LeadingTimeUnit): Competitor => ({
  ...competitor,
  time: null,
  timeString: parseMinTime(null, 2, leadingUnit),
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
