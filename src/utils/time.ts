/**
 * The largest unit a written time always shows, even when it is zero.
 *
 * A stopwatch grows into it: under a minute `12.34`, past one `01:12.34`. Everything
 * written next to that clock has to be padded the same way, or a corrected time would
 * suddenly look unlike the one above it.
 */
export type LeadingTimeUnit = 'hours' | 'minutes' | 'seconds'

/**
 * `M:SS` - the countdown a fight clock shows, with the minutes never rolling into
 * hours: a four minute round written as `4:00` and an hour of them as `60:00`.
 */
export const parseTime = (sec: number): string => {
  const minutes = Math.floor(sec / 60)
  const seconds = Math.floor(sec) - minutes * 60

  return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`
}

export const createTimePlaceholder = (
  withDecimals = 0,
  alwaysPad: LeadingTimeUnit = 'seconds',
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
  alwaysPad?: LeadingTimeUnit
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
    // Times reach this function as whole milliseconds divided by a thousand, and `12.34`
    // has no exact float, so `cur - seconds` comes out as `0.33999999999999986` and
    // truncating it loses a hundredth. Recovering the milliseconds and staying in whole
    // numbers keeps the truncation the rest of the app expects - rounding the difference
    // instead would agree here and disagree on every time that is not a whole hundredth.
    const totalMs = Math.round(cur * 1000)
    const toShow = Math.floor((totalMs % 1000) / Math.pow(10, 3 - withDecimals))
    ret += `.${toShow.toString().padStart(withDecimals, '0')}`
  }

  return ret
}
