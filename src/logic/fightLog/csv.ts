import { Translation } from '../translation/translation'
import { formatFightEvent, sideLabel } from './format'
import { FightEvent, FightLogEntry } from '../../types/fightLog'
import { Senchu } from '../../types/senchu'
import { Fight } from '../../types/tournament'
import { buildCsv } from '../../utils/csv'
import { insertWords } from '../translation'
import { fileNameStamp } from '../download/fileName'


/**
 * What the export needs to know about a fight.
 *
 * A structural subset of {@link Fight} rather than the entity itself, because a
 * fight played outside a tournament has no entity at all - its state lives in
 * the screen. Naming only what is read also keeps a real `Fight` acceptable as
 * it stands, so the tournament export will not need to map anything, and it
 * keeps `uuidV4()` out of the tests.
 */
export type ExportedFight
  = Pick<Fight, 'redPoints' | 'redFouls' | 'bluePoints' | 'blueFouls' | 'senchu'>
  & {
    tournamentName?: string,
    redName?: string,
    blueName?: string,
    log: FightLogEntry[],
  }

const pad = (value: number): string => value.toString().padStart(2, '0')

/** Local time throughout, so the file reads in the clock of whoever exported it. */
const localDateTime = (at: number): string => {
  const date = new Date(at)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const fightCsvFileName = (now: Date): string => `kumite-${fileNameStamp(now)}.csv`

/** Nobody holding senchu is an empty cell rather than the word for it. */
const senchuCell = (senchu: Senchu): string => senchu === 'NONE' ? '' : sideLabel(senchu)

/**
 * The corner and the number an event carries, for the columns meant to be
 * filtered and summed rather than read.
 *
 * One rule runs through the whole file: **a corner is always AKA or AO**, in
 * every column that names one, because that is what the app calls them on screen
 * and in the log. Event kinds stay raw keys instead - they are identifiers, and
 * a file exported in Czech has to be filterable the same way as one exported in
 * English.
 *
 * Exhaustive on purpose. A new kind of event has to be given its columns here,
 * and leaving it out is a type error rather than a quietly empty cell.
 */
const eventCells = (event: FightEvent): [side: string, value: string] => {
  switch (event.kind) {
    case 'POINTS':
      return [sideLabel(event.side), String(event.delta)]
    case 'FOULS':
      return [sideLabel(event.side), String(event.to)]
    case 'SENCHU':
      return ['', senchuCell(event.to)]
    case 'TIME_SET':
      // seconds, not `1:22` - this column is the one worth doing arithmetic on
      return ['', String(event.to)]
    case 'START':
    case 'PAUSE':
    case 'RESUME':
    case 'RESET':
    case 'END':
    case 'REOPEN':
      return ['', '']
  }
}

/** The one header, shared by the export of a single fight and of a whole tournament. */
export const fightCsvHeader = (translation: Translation): string[] => {
  const { kumiteTimer: { timerScreen: { export: t } }, common: ct } = translation

  return [
    t.tournament, 'AKA', 'AO',
    ct.time, t.remaining, t.type, t.side, t.value, t.description,
    insertWords(t.finalPoints, 'AKA'), insertWords(t.finalFouls, 'AKA'),
    insertWords(t.finalPoints, 'AO'), insertWords(t.finalFouls, 'AO'),
    t.finalSenchu,
  ]
}

/**
 * The body of the export of one fight: a row per logged event, with the fight
 * itself repeated on each of them.
 *
 * The repetition is the point rather than an oversight. It costs a few kilobytes
 * on a single fight and it makes the export of a whole tournament a concatenation
 * of these instead of a second format to design and maintain - which is exactly
 * what {@link buildTournamentLogCsv} does with them.
 */
export const fightCsvRows = (fight: ExportedFight, translation: Translation): string[][] => {
  const { kumiteTimer: { timerScreen: { log: logTranslation } } } = translation

  const fightCells = [fight.tournamentName ?? '', fight.redName ?? '', fight.blueName ?? '']
  const resultCells = [
    String(fight.redPoints), String(fight.redFouls),
    String(fight.bluePoints), String(fight.blueFouls),
    senchuCell(fight.senchu),
  ]

  // seconds rather than `1:22`: a spreadsheet reads that shape as hours and
  // minutes, so five seconds left would come out as five minutes
  const eventRow = (entry: FightLogEntry): string[] => [
    localDateTime(entry.at), String(entry.fightTime), entry.event.kind,
    ...eventCells(entry.event), formatFightEvent(entry.event, logTranslation),
  ]

  // a fight with nothing logged still has a state, and it is worth exporting
  const bodyRows = fight.log.length === 0
    ? [['', '', '', '', '', '']]
    : fight.log.map(eventRow)

  return bodyRows.map((event) => [...fightCells, ...event, ...resultCells])
}

/** The export of one fight, as its own file. */
export const buildFightCsv = (fight: ExportedFight, translation: Translation): string => {
  return buildCsv([fightCsvHeader(translation), ...fightCsvRows(fight, translation)])
}
