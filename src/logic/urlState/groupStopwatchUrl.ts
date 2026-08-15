import { State, initialState } from '../../redux/groupStopwatch/state'
import { VALIDATOR } from '../../redux/groupStopwatch/utils'
import { CompetitorSetup, newCompetitorSetup } from '../../types/groupStopwatch'
import { joinList, parseColor, readNumber, serializeColor, splitList, writeIfChanged } from './params'


export type GroupStopwatchSetUp = Pick<State, 'competitorsCount' | 'competitors'>

export const GROUP_STOPWATCH_SET_UP_PATH = '/group-stopwatch/set-up'

const KEYS = ['count', 'names', 'colors'] as const

const COLOR_SEPARATOR = '-'

const DEFAULT_COLOR = newCompetitorSetup().color

export const defaultGroupStopwatchSetUp = (): GroupStopwatchSetUp => ({
  competitorsCount: initialState.competitorsCount,
  competitors: initialState.competitors,
})

export const hasGroupStopwatchSetUp = (params: URLSearchParams): boolean => {
  return KEYS.some((key) => params.has(key))
}

export const encodeGroupStopwatchSetUp = (setUp: GroupStopwatchSetUp): URLSearchParams => {
  const params = new URLSearchParams()
  const d = defaultGroupStopwatchSetUp()

  // only the competitors that are actually in use are worth sharing
  const used = setUp.competitors.slice(0, setUp.competitorsCount)

  writeIfChanged(params, 'count', setUp.competitorsCount, d.competitorsCount)

  if (used.some((c) => c.name !== '')) {
    params.set('names', joinList(used.map((c) => c.name)))
  }

  // the colours are all the same in the common case, so they only bloat the link
  if (used.some((c) => c.color !== DEFAULT_COLOR)) {
    params.set('colors', used.map((c) => serializeColor(c.color)).join(COLOR_SEPARATOR))
  }

  return params
}

export const decodeGroupStopwatchSetUp = (
  params: URLSearchParams,
  defaults: GroupStopwatchSetUp = defaultGroupStopwatchSetUp(),
): GroupStopwatchSetUp => {
  const competitorsCount = readNumber(params, 'count', VALIDATOR.competitorsCount, defaults.competitorsCount)

  const rawNames = params.get('names')
  const rawColors = params.get('colors')

  if (rawNames === null && rawColors === null) {
    return { competitorsCount, competitors: defaults.competitors }
  }

  const names = rawNames === null ? [] : splitList(rawNames)
  const colors = rawColors === null ? [] : rawColors.split(COLOR_SEPARATOR).map(parseColor)

  const length = Math.max(names.length, colors.length, competitorsCount)

  const competitors: CompetitorSetup[] = Array.from({ length }, (_, i) => {
    return newCompetitorSetup(names[i] ?? '', colors[i] ?? DEFAULT_COLOR)
  })

  return {
    competitorsCount,
    competitors: VALIDATOR.competitors(competitors) ? competitors : defaults.competitors,
  }
}
