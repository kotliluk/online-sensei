import { State, initialState } from '../../redux/intervalTimer/state'
import { VALIDATOR } from '../../redux/intervalTimer/utils'
import { BeepType } from '../../types/beepType'
import { Interval, IntervalType } from '../../types/interval'
import {
  joinFields,
  joinList,
  readBoolean,
  readList,
  readNumber,
  readString,
  serializeBoolean,
  splitFields,
  writeIfChanged,
} from './params'


type Common = Pick<State, 'skipLastPause' | 'audioSound' | 'audioVolume'>

export type IntervalTimerSimpleSetUp = Pick<State, 'simpleRounds' | 'simpleWork' | 'simplePause'> & Common
export type IntervalTimerAdvancedSetUp = Pick<State, 'advancedRoundIntervals' | 'advancedRounds'> & Common

export const INTERVAL_TIMER_SIMPLE_SET_UP_PATH = '/interval-timer/set-up'
export const INTERVAL_TIMER_ADVANCED_SET_UP_PATH = '/interval-timer/set-up-advanced'

const COMMON_KEYS = ['skip', 'sound', 'vol'] as const
const SIMPLE_KEYS = ['rounds', 'work', 'pause', ...COMMON_KEYS] as const
const ADVANCED_KEYS = ['rounds', 'iv', ...COMMON_KEYS] as const

/** ******************* Common part *********************/

const writeCommon = (params: URLSearchParams, setUp: Common, d: Common): void => {
  writeIfChanged(params, 'skip', setUp.skipLastPause, d.skipLastPause, serializeBoolean)
  writeIfChanged(params, 'sound', setUp.audioSound, d.audioSound)
  writeIfChanged(params, 'vol', setUp.audioVolume, d.audioVolume)
}

const readCommon = (params: URLSearchParams, d: Common): Common => ({
  skipLastPause: readBoolean(params, 'skip', d.skipLastPause),
  audioSound: readString<BeepType>(params, 'sound', VALIDATOR.audioSound, d.audioSound),
  audioVolume: readNumber(params, 'vol', VALIDATOR.audioVolume, d.audioVolume),
})

/** ******************* Simple set up *********************/

export const defaultIntervalTimerSimpleSetUp = (): IntervalTimerSimpleSetUp => ({
  simpleRounds: initialState.simpleRounds,
  simpleWork: initialState.simpleWork,
  simplePause: initialState.simplePause,
  skipLastPause: initialState.skipLastPause,
  audioSound: initialState.audioSound,
  audioVolume: initialState.audioVolume,
})

export const hasIntervalTimerSimpleSetUp = (params: URLSearchParams): boolean => {
  return SIMPLE_KEYS.some((key) => params.has(key))
}

export const encodeIntervalTimerSimpleSetUp = (setUp: IntervalTimerSimpleSetUp): URLSearchParams => {
  const params = new URLSearchParams()
  const d = defaultIntervalTimerSimpleSetUp()

  writeIfChanged(params, 'rounds', setUp.simpleRounds, d.simpleRounds)
  writeIfChanged(params, 'work', setUp.simpleWork, d.simpleWork)
  writeIfChanged(params, 'pause', setUp.simplePause, d.simplePause)
  writeCommon(params, setUp, d)

  return params
}

export const decodeIntervalTimerSimpleSetUp = (
  params: URLSearchParams,
  defaults: IntervalTimerSimpleSetUp = defaultIntervalTimerSimpleSetUp(),
): IntervalTimerSimpleSetUp => ({
  simpleRounds: readNumber(params, 'rounds', VALIDATOR.simpleRounds, defaults.simpleRounds),
  simpleWork: readNumber(params, 'work', VALIDATOR.simpleWork, defaults.simpleWork),
  simplePause: readNumber(params, 'pause', VALIDATOR.simplePause, defaults.simplePause),
  ...readCommon(params, defaults),
})

/** ******************* Advanced set up *********************/

const INTERVAL_TYPES: Record<string, IntervalType> = { w: 'work', p: 'pause' }

const serializeInterval = (interval: Interval): string => {
  return joinFields([interval.type === 'work' ? 'w' : 'p', interval.name, String(interval.duration)])
}

const parseInterval = (item: string): Interval | null => {
  const [type, name, duration] = splitFields(item)

  if (!(type in INTERVAL_TYPES) || name === undefined || duration === undefined) {
    return null
  }

  const parsedDuration = Number(duration)

  if (!Number.isFinite(parsedDuration)) {
    return null
  }

  return { type: INTERVAL_TYPES[type], name, duration: parsedDuration }
}

export const defaultIntervalTimerAdvancedSetUp = (): IntervalTimerAdvancedSetUp => ({
  advancedRoundIntervals: initialState.advancedRoundIntervals,
  advancedRounds: initialState.advancedRounds,
  skipLastPause: initialState.skipLastPause,
  audioSound: initialState.audioSound,
  audioVolume: initialState.audioVolume,
})

export const hasIntervalTimerAdvancedSetUp = (params: URLSearchParams): boolean => {
  return ADVANCED_KEYS.some((key) => params.has(key))
}

export const encodeIntervalTimerAdvancedSetUp = (setUp: IntervalTimerAdvancedSetUp): URLSearchParams => {
  const params = new URLSearchParams()
  const d = defaultIntervalTimerAdvancedSetUp()

  writeIfChanged(params, 'rounds', setUp.advancedRounds, d.advancedRounds)
  writeIfChanged(
    params,
    'iv',
    setUp.advancedRoundIntervals,
    d.advancedRoundIntervals,
    (intervals) => joinList(intervals.map(serializeInterval)),
  )
  writeCommon(params, setUp, d)

  return params
}

export const decodeIntervalTimerAdvancedSetUp = (
  params: URLSearchParams,
  defaults: IntervalTimerAdvancedSetUp = defaultIntervalTimerAdvancedSetUp(),
): IntervalTimerAdvancedSetUp => ({
  advancedRoundIntervals: readList(
    params,
    'iv',
    parseInterval,
    // an empty list would leave the advanced screen with nothing to edit
    (intervals) => intervals.length > 0 && VALIDATOR.advancedRoundIntervals(intervals),
    defaults.advancedRoundIntervals,
  ),
  advancedRounds: readNumber(params, 'rounds', VALIDATOR.advancedRounds, defaults.advancedRounds),
  ...readCommon(params, defaults),
})
