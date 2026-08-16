import { playedFights, TournamentSource, tournamentFights } from './collect'
import { fightCsvHeader, fightCsvRows } from '../fightLog/csv'
import { Translation } from '../translation/translation'
import { insertWords } from '../translation'
import { Fight, getTreeDepth } from '../../types/tournament'
import { groupRowStats } from '../../types/tournament'
import { buildCsv } from '../../utils/csv'
import { fileNameSlug, fileNameStamp } from '../download/fileName'


type ExportTranslation = Translation['kumiteTimer']['tournamentScreen']['export']

/**
 * The whole tournament in the format one fight already has: one header, then
 * every fight's rows behind each other.
 *
 * This is what the flat shape chosen in ticket 002 was for. A file of one fight
 * and a file of a whole tournament are the same format, so a filter written for
 * one works on the other, and there is a single set of columns to maintain.
 */
export const buildTournamentLogCsv = (source: TournamentSource, translation: Translation): string => {
  const fights = playedFights(source)

  return buildCsv([
    fightCsvHeader(translation),
    ...fights.flatMap((fight) => fightCsvRows(fight, translation)),
  ])
}

/**
 * A score as one cell, the way the table on screen writes it.
 *
 * A spreadsheet may well read `3:1` as a time - the same trap that turned the
 * clock column into hours and minutes. It is left as it is anyway, because the
 * two cases fail differently: `3:01:00` in a score column is obviously not a
 * score, while five seconds shown as five minutes was a plausible lie. A cell
 * nobody can misread is worth more than a cell nothing can reformat.
 */
const scoreCell = (fight: Fight): string => {
  return fight.winner === undefined ? '' : `${fight.redPoints}:${fight.bluePoints}`
}

/**
 * The group table as it is on screen: names across the top and down the side,
 * the score in the crossing cell, the tally on the right.
 *
 * The names are read off the table rather than taken from the competitor list,
 * so the file cannot disagree with the thing it is a copy of.
 */
const buildGroupOverviewCsv = (source: TournamentSource, translation: Translation): string => {
  const { kumiteTimer: { setUpScreen: { tournament: { tableStatsLabels: t } } } } = translation
  const group = source.group
  const names = group.map((row) => row[0].redName)

  const header = ['', ...names, t.win, t.draw, t.loss, '+', '-', '+/-']

  const bodyRows = group.map((row, rowIndex) => {
    const stats = groupRowStats(row)

    return [
      names[rowIndex],
      // a fighter has no fight against themselves, however the table is laid out
      ...row.map((fight, columnIndex) => rowIndex === columnIndex ? '' : scoreCell(fight)),
      String(stats.wins), String(stats.draws), String(stats.losses),
      String(stats.plusPoints), String(stats.minusPoints), String(stats.plusPoints - stats.minusPoints),
    ]
  })

  return buildCsv([header, ...bodyRows])
}

/**
 * What to call the round a fight belongs to.
 *
 * Only the last two rounds have names of their own; below that they are counted
 * from the first one, because the bracket of an entry level tournament is rarely
 * a full one and "quarterfinal" would then be a guess rather than a fact.
 */
const roundLabel = (fight: Fight, treeDepth: number, t: ExportTranslation): string => {
  if (fight.type === 'REPECHAGE_1') {
    return insertWords(t.repechageLine, 1)
  }
  if (fight.type === 'REPECHAGE_2') {
    return insertWords(t.repechageLine, 2)
  }
  if (fight.depth === 0) {
    return t.final
  }
  if (fight.depth === 1) {
    return t.semifinal
  }

  return insertWords(t.nthRound, treeDepth - fight.depth + 1)
}

/**
 * A bracket as a row per fight, first round first.
 *
 * The winner is written by name rather than by corner: this file is the one a
 * person reads, and "Aneta" answers the question the column asks, while "AKA"
 * only points at where she was standing.
 */
const buildTreeOverviewCsv = (source: TournamentSource, translation: Translation): string => {
  const { kumiteTimer: { tournamentScreen: { export: t }, setUpScreen: { tournament: { tableStatsLabels } } } }
    = translation
  const treeDepth = getTreeDepth(source.tree)

  const header = [t.round, 'AKA', 'AO', insertWords(t.points, 'AKA'), insertWords(t.points, 'AO'), t.winner]

  const winnerCell = (fight: Fight): string => {
    if (fight.winner === undefined) {
      return ''
    }
    if (fight.winner === 'DRAW') {
      return tableStatsLabels.draw
    }

    return fight.winner === 'RED' ? fight.redName : fight.blueName
  }

  const bodyRows = tournamentFights(source).map((fight) => [
    roundLabel(fight, treeDepth, t),
    fight.redName, fight.blueName,
    fight.winner === undefined ? '' : String(fight.redPoints),
    fight.winner === undefined ? '' : String(fight.bluePoints),
    winnerCell(fight),
  ])

  return buildCsv([header, ...bodyRows])
}

/** The tournament as it looks on screen - a table for a group, a list of rounds for a bracket. */
export const buildTournamentOverviewCsv = (source: TournamentSource, translation: Translation): string => {
  return source.type === 'GROUP'
    ? buildGroupOverviewCsv(source, translation)
    : buildTreeOverviewCsv(source, translation)
}

/**
 * `kumite-camp-log-2026-08-15-0905.csv`.
 *
 * The tournament is named in the file as well as in it, because the two files of
 * one tournament land in the same folder as the two files of the next one.
 */
export const tournamentCsvFileName = (part: 'log' | 'overview', name: string, now: Date): string => {
  const slug = fileNameSlug(name)

  return `kumite${slug === '' ? '' : `-${slug}`}-${part}-${fileNameStamp(now)}.csv`
}
