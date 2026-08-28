import { State, initialState } from '../../redux/reactions/state'
import { VALIDATOR } from '../../redux/reactions/utils'
import { BeepType } from '../../types/beepType'
import { THexColor } from '../../types/color'
import { parseColor, readNumber, readString, serializeColor, writeIfChanged } from './params'


export type ReactionsSetUp = Omit<State, 'isActual'>

export const REACTIONS_SET_UP_PATH = '/reactions/set-up'

const KEYS = ['rounds', 'signal', 'min', 'max', 'count', 'colors', 'sound', 'vol'] as const

const COLOR_SEPARATOR = '-'

export const defaultReactionsSetUp = (): ReactionsSetUp => {
  const { isActual: _isActual, ...rest } = initialState
  return rest
}

export const hasReactionsSetUp = (params: URLSearchParams): boolean => {
  return KEYS.some((key) => params.has(key))
}

export const encodeReactionsSetUp = (setUp: ReactionsSetUp): URLSearchParams => {
  const params = new URLSearchParams()
  const d = defaultReactionsSetUp()

  writeIfChanged(params, 'rounds', setUp.rounds, d.rounds)
  writeIfChanged(params, 'signal', setUp.signalDuration, d.signalDuration)
  writeIfChanged(params, 'min', setUp.minInterval, d.minInterval)
  writeIfChanged(params, 'max', setUp.maxInterval, d.maxInterval)
  writeIfChanged(params, 'count', setUp.signalCount, d.signalCount)
  writeIfChanged(
    params,
    'colors',
    setUp.signalColors,
    d.signalColors,
    (colors) => colors.map(serializeColor).join(COLOR_SEPARATOR),
  )
  writeIfChanged(params, 'sound', setUp.audioSound, d.audioSound)
  writeIfChanged(params, 'vol', setUp.audioVolume, d.audioVolume)

  return params
}

export const decodeReactionsSetUp = (
  params: URLSearchParams,
  defaults: ReactionsSetUp = defaultReactionsSetUp(),
): ReactionsSetUp => {
  const rawColors = params.get('colors')
  // the validator insists on a colour for every possible signal, even the
  // ones the current signal count does not use
  const colors: THexColor[] = rawColors === null
    ? defaults.signalColors
    : (() => {
      const parsed = rawColors.split(COLOR_SEPARATOR).map(parseColor)
      const padded = defaults.signalColors.map((fallback, i) => parsed[i] ?? fallback)
      return VALIDATOR.signalColors(padded) ? padded : defaults.signalColors
    })()

  const minInterval = readNumber(params, 'min', VALIDATOR.minInterval, defaults.minInterval)
  const maxInterval = readNumber(params, 'max', VALIDATOR.maxInterval, defaults.maxInterval)

  return {
    rounds: readNumber(params, 'rounds', VALIDATOR.rounds, defaults.rounds),
    signalDuration: readNumber(params, 'signal', VALIDATOR.signalDuration, defaults.signalDuration),
    // a shared link must never arrive with a reversed range - the set-up screen
    // has no way to show an error for a value the recipient never typed
    minInterval: minInterval <= maxInterval ? minInterval : defaults.minInterval,
    maxInterval: minInterval <= maxInterval ? maxInterval : defaults.maxInterval,
    signalCount: readNumber(params, 'count', VALIDATOR.signalCount, defaults.signalCount),
    signalColors: colors,
    audioSound: readString<BeepType>(params, 'sound', VALIDATOR.audioSound, defaults.audioSound),
    audioVolume: readNumber(params, 'vol', VALIDATOR.audioVolume, defaults.audioVolume),
  }
}
