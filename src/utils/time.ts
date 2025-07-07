/* eslint-disable no-multi-spaces */
/* eslint-disable array-bracket-spacing */

export enum TimeUnit {
  HOURS = 0,
  MINUTES = 1,
  SECONDS = 2,
  TENTHS = 3,
}

// [from][to]
const castTable = [
  [1,                  60,            60 * 60, 60 * 60 * 10],
  [1 / 60,             1,             60,      60 * 10     ],
  [1 / (60 * 60),      1 / 60,        1,       10          ],
  [1 / (60 * 60 * 10), 1 / (60 * 10), 1 / 10,  1             ],
]

export const castUnits = (amount: number, inUnit: TimeUnit, outUnit: TimeUnit): number => {
  return amount * castTable[inUnit][outUnit]
}

export const parseTime = (
  input: number,
  inputUnit: TimeUnit = TimeUnit.SECONDS,
  maxUnit: TimeUnit = TimeUnit.MINUTES,
  minUnit: TimeUnit = TimeUnit.SECONDS,
): string => {
  // lower numbers mean higher units (HOURS = 0, ...)
  if (maxUnit > minUnit) {
    const tmp = maxUnit
    maxUnit = minUnit
    minUnit = tmp
  }

  const inputSec = castUnits(input, inputUnit, TimeUnit.SECONDS)

  const hours = Math.floor(inputSec / 3600)
  let minutes = Math.floor(inputSec / 60)
  let seconds = Math.floor(inputSec)
  let tenths = Math.floor(inputSec * 10)

  let ret = ''

  if (maxUnit <= TimeUnit.HOURS && minUnit >= TimeUnit.HOURS) {
    ret += hours.toString()
    minutes -= hours * 60
    seconds -= hours * 60 * 60
    tenths -= hours * 60 * 60 * 10
  }
  if (maxUnit <= TimeUnit.MINUTES && minUnit >= TimeUnit.MINUTES) {
    if (maxUnit < TimeUnit.MINUTES) {
      ret += `:${minutes.toString().padStart(2, '0')}`
    } else {
      ret += `${minutes.toString()}`
    }
    seconds -= minutes * 60
    tenths -= minutes * 60 * 10
  }
  if (maxUnit <= TimeUnit.SECONDS && minUnit >= TimeUnit.SECONDS) {
    if (maxUnit < TimeUnit.SECONDS) {
      ret += `:${seconds.toString().padStart(2, '0')}`
    } else {
      ret += `${seconds.toString()}`
    }
    tenths -= seconds * 10
  }
  if (maxUnit <= TimeUnit.TENTHS && minUnit >= TimeUnit.TENTHS) {
    if (maxUnit < TimeUnit.TENTHS) {
      ret += `.${tenths.toString()}`
    } else {
      ret += `${tenths.toString()}`
    }
  }

  return ret
}

export const createTimePlaceholder = (
  withDecimals = 0,
  alwaysPad: 'hours' | 'minutes' | 'seconds' = 'seconds',
): string => {
  const padHours = alwaysPad === 'hours'
  const padMinutes = alwaysPad === 'hours' || alwaysPad === 'minutes'
  const padSeconds = alwaysPad === 'hours' || alwaysPad === 'minutes' || alwaysPad === 'seconds'

  let decimals = withDecimals ? '.' : ''
  for (let i = 0; i < withDecimals; ++i) {
    decimals += '-'
  }

  return `${padHours ? '--:' : ''}${padMinutes ? '--:' : ''}${padSeconds ? '--' : ''}${decimals}`
}

export const parseMinTime = (
  sec: number | null,
  withDecimals = 0,
  alwaysPad?: 'hours' | 'minutes' | 'seconds'
): string => {
  if (sec === null) {
    return createTimePlaceholder(withDecimals, alwaysPad)
  }

  const padHours = alwaysPad === 'hours'
  const padMinutes = alwaysPad === 'hours' || alwaysPad === 'minutes'
  const padSeconds = alwaysPad === 'hours' || alwaysPad === 'minutes' || alwaysPad === 'seconds'

  let ret = ''
  let cur = sec
  if (sec >= 3600 || padHours) {
    const hours = Math.floor(cur / 3600)
    cur -= hours * 3600
    ret += `${hours.toString().padStart(padHours ? 2 : 1, '0')}:`
  }
  if (sec >= 60 || padMinutes) {
    const minutes = Math.floor(cur / 60)
    cur -= minutes * 60
    ret += `${minutes.toString().padStart((ret.length > 0 || padMinutes) ? 2 : 1, '0')}:`
  }
  const seconds = Math.floor(cur)
  ret += `${seconds.toString().padStart((ret.length > 0 || padSeconds) ? 2 : 1, '0')}`

  if (withDecimals > 0) {
    const decimals = cur - seconds
    const toShow = Math.floor(decimals * Math.pow(10, withDecimals))
    ret += `.${toShow.toString().padStart(withDecimals, '0')}`
  }

  return ret
}
