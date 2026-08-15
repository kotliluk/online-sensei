import { insertWords } from '../translation'
import { Translation } from '../translation/translation'
import { FightEvent, FightSide } from '../../types/fightLog'
import { Senchu } from '../../types/senchu'
import { parseTime } from '../../utils/time'


type LogTranslation = Translation['kumiteTimer']['timerScreen']['log']

/** The corners are called aka and ao in any language, so these are not translated. */
export const sideLabel = (side: FightSide): string => side === 'RED' ? 'AKA' : 'AO'

const senchuLabel = (senchu: Senchu, t: LogTranslation): string => {
  return senchu === 'NONE' ? t.senchuNone : sideLabel(senchu)
}

/**
 * One log entry as a line of text, in the language the app is set to.
 *
 * Points keep their sign - `AKA +3` is how an ippon is read out, and a `-1`
 * says plainly that something was taken back rather than given.
 */
export const formatFightEvent = (event: FightEvent, t: LogTranslation): string => {
  switch (event.kind) {
    case 'START':
      return t.start
    case 'PAUSE':
      return t.pause
    case 'RESUME':
      return t.resume
    case 'RESET':
      return t.reset
    case 'END':
      return t.end
    case 'REOPEN':
      return insertWords(t.reopen, event.redPoints, event.bluePoints)
    case 'POINTS':
      return `${sideLabel(event.side)} ${event.delta > 0 ? '+' : ''}${event.delta}`
    case 'FOULS':
      return insertWords(t.fouls, sideLabel(event.side), event.from, event.to)
    case 'SENCHU':
      return insertWords(t.senchu, senchuLabel(event.to, t))
    case 'TIME_SET':
      return insertWords(t.time, parseTime(event.from), parseTime(event.to))
  }
}
