import { Fight, TournamentTreeNode, TournamentType } from '../../types/tournament'
import { ExportedFight } from '../fightLog/csv'


/** The whole tournament as the export sees it, whichever system it is run in. */
export type TournamentSource = {
  name: string,
  type: TournamentType,
  group: Fight[][],
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null,
}

/**
 * The upper triangle of a group table.
 *
 * The table holds every pairing three times over: once in the upper half, once
 * mirrored in the lower one with the fighters and the log the other way round,
 * and once on the diagonal as a fighter against themselves. Only the upper half
 * is ever stepped into (`GroupTableCell.tsx:22`), so that is the half where the
 * corners are the ones people actually stood in.
 */
const groupFights = (group: Fight[][]): Fight[] => {
  return group.flatMap((row, rowIndex) => row.filter((_, columnIndex) => rowIndex < columnIndex))
}

/**
 * A bracket flattened with the deepest fights first, which is the order they are
 * fought in.
 *
 * The level is counted while walking rather than read off `fight.depth`: the
 * repechage lines are built with `newFight`, which leaves every one of them at
 * depth 0, so the stored depth only means anything in the main tree.
 */
const treeFights = (node: TournamentTreeNode | null, level = 0): { level: number, fight: Fight }[] => {
  if (!node) {
    return []
  }

  const fight = node.attributes.fight
  // the repechage root is a layout device holding the two lines, not a fight
  const here = fight.type === 'REPECHAGE_ROOT' ? [] : [{ level, fight }]

  return [...here, ...node.children.flatMap((child) => treeFights(child, level + 1))]
}

const byDeepestFirst = (nodes: { level: number, fight: Fight }[]): Fight[] => {
  return [...nodes].sort((a, b) => b.level - a.level).map((node) => node.fight)
}

/**
 * Every fight the tournament holds, once each, in the order it is fought in.
 *
 * Fights nobody can step into yet are included - a bracket waiting for the
 * winner of a semifinal is still part of the picture. Filtering those out is
 * {@link playedFights}' business.
 */
export const tournamentFights = (source: TournamentSource): Fight[] => {
  if (source.type === 'GROUP') {
    return groupFights(source.group)
  }

  return [...byDeepestFirst(treeFights(source.tree)), ...byDeepestFirst(treeFights(source.repechage))]
}

const isPlayed = (fight: Fight): boolean => (fight.log?.length ?? 0) > 0 || fight.winner !== undefined

/**
 * When the fight started, for ordering the export.
 *
 * A fight saved without the clock ever running has nothing to go by, so it sorts
 * last rather than first - it is the exception, and the exception belongs at the
 * end. Note the sentinel is a real number: `Infinity - Infinity` is `NaN`, and a
 * comparator that returns `NaN` silently leaves the array in whatever order it
 * happened to be in.
 */
const startedAt = (fight: Fight): number => fight.log?.[0]?.at ?? Number.MAX_SAFE_INTEGER

/**
 * The fights worth exporting, oldest first - the file is a log, so it reads in
 * the order the day happened rather than in the order the table is laid out.
 */
export const playedFights = (source: TournamentSource): ExportedFight[] => {
  return tournamentFights(source)
    .filter(isPlayed)
    .sort((a, b) => startedAt(a) - startedAt(b))
    .map((fight) => ({ ...fight, tournamentName: source.name, log: fight.log ?? [] }))
}
