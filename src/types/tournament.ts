import { v4 as uuidV4 } from 'uuid'
import { arrayOfDefined, split } from '../utils/array'
import { Senchu, switchSenchu } from './senchu'
import { FightLogEntry, isValidFightLog, switchFightLogSides } from './fightLog'


export type TournamentType = 'TREE' | 'GROUP'

export type Competitor = {
  uuid: string,
  name: string,
}

export const newCompetitor = (name = ''): Competitor => ({
  uuid: uuidV4(),
  name,
})

export const isValidCompetitor = (x: any): x is Competitor => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.uuid === 'string') && (typeof x.name === 'string')
}

export type FightWinner = 'BLUE' | 'RED' | 'DRAW'

export type FightType = 'MAIN' | 'REPECHAGE_1' | 'REPECHAGE_2' | 'REPECHAGE_ROOT'

export type Fight = {
  uuid: string,
  type: FightType,
  depth: number,
  winner: FightWinner | undefined,
  redUuid: string,
  redName: string,
  redPoints: number,
  redFouls: number,
  blueUuid: string,
  blueName: string,
  bluePoints: number,
  blueFouls: number,
  senchu: Senchu,
  oppositeFight: string | undefined,
  /** Optional: fights stored before the log existed do not have one. */
  log?: FightLogEntry[],
}

export type FightResult = {
  uuid: string,
  type: FightType,
  winner: FightWinner,
  redPoints: number,
  redFouls: number,
  bluePoints: number,
  blueFouls: number,
  senchu: Senchu,
  oppositeFight: string | undefined,
  /**
   * Required, unlike the one on {@link Fight}: a result is built field by field
   * in two places and never read back from storage, so making it compulsory is
   * what stops it being quietly left out of one of them.
   */
  log: FightLogEntry[],
}

/**
 * The result as the opposite cell of a group table sees it - there the same
 * fight is listed with the fighters the other way round.
 *
 * Everything the result carries has to be named here, so anything added to
 * {@link FightResult} has to be added here as well or it silently goes missing
 * from half of the table.
 */
export const switchResultSides = (fight: FightResult): FightResult => {
  return {
    uuid: fight.uuid,
    type: fight.type,
    winner: (fight.winner === 'RED' ? 'BLUE' : (fight.winner === 'BLUE' ? 'RED' : 'DRAW')),
    redPoints: fight.bluePoints,
    redFouls: fight.blueFouls,
    bluePoints: fight.redPoints,
    blueFouls: fight.redFouls,
    senchu: switchSenchu(fight.senchu),
    oppositeFight: fight.oppositeFight,
    log: switchFightLogSides(fight.log),
  }
}

export const newFight = (
  redUuid: string,
  redName: string,
  blueUuid: string,
  blueName: string,
  type: FightType = 'MAIN',
): Fight => ({
  uuid: uuidV4(),
  depth: 0,
  type,
  winner: undefined,
  redUuid,
  redName,
  redPoints: 0,
  redFouls: 0,
  blueUuid,
  blueName,
  bluePoints: 0,
  blueFouls: 0,
  senchu: 'NONE',
  oppositeFight: undefined,
  log: [],
})

export const isValidFight = (x: any): x is Fight => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.uuid === 'string') && (typeof x.depth === 'number') && (typeof x.type === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.winner === 'undefined' || typeof x.winner === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@stylistic/max-len
    && (typeof x.redUuid === 'string') && (typeof x.redName === 'string') && (typeof x.redPoints === 'number') && (typeof x.redFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@stylistic/max-len
    && (typeof x.blueUuid === 'string') && (typeof x.blueName === 'string') && (typeof x.bluePoints === 'number') && (typeof x.blueFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.senchu === 'string') && (x.senchu === 'RED' || x.senchu === 'BLUE' || x.senchu === 'NONE')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.oppositeFight === 'undefined' || typeof x.oppositeFight === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && isValidFightLog(x.log)
}

export type GroupRowStats = {
  wins: number,
  draws: number,
  losses: number,
  plusPoints: number,
  minusPoints: number,
}

/**
 * The tally at the end of one row of a group table.
 *
 * Over the **whole** row, mirrored half included: every fight of that competitor
 * is listed in their row with them in the red corner, which is what the mirror is
 * for. (The export of the fights themselves takes the opposite view and reads only
 * the upper triangle, because there each fight is listed once - see
 * `logic/tournament/collect.ts`.)
 *
 * A pure function rather than a calculation inside the row component, because the
 * exported overview has to show the same numbers as the screen, and the only way
 * to be sure they cannot drift apart is to have one place that works them out.
 */
export const groupRowStats = (row: Fight[]): GroupRowStats => ({
  wins: row.reduce((agg, fight) => agg + (fight.winner === 'RED' ? 1 : 0), 0),
  draws: row.reduce((agg, fight) => agg + (fight.winner === 'DRAW' ? 1 : 0), 0),
  losses: row.reduce((agg, fight) => agg + (fight.winner === 'BLUE' ? 1 : 0), 0),
  plusPoints: row.reduce((agg, fight) => agg + fight.redPoints, 0),
  minusPoints: row.reduce((agg, fight) => agg + fight.bluePoints, 0),
})

/**
 * Who the result dialog offers as the winner before anybody touches it.
 *
 * It is a suggestion, not a verdict - the referee at the table can override it. But it is
 * the last thing between a fight and the tournament tree, and the whole point of offering
 * it is that it usually gets confirmed rather than read, so it has to be right.
 *
 * Order matters: five fouls settle the fight whatever the score, points beat senchu, and
 * only a group may end level.
 */
export const defaultWinner = (fight: Fight, tournamentType: TournamentType): FightWinner => {
  if (fight.redFouls === 5) {
    return 'BLUE'
  }
  if (fight.blueFouls === 5) {
    return 'RED'
  }
  if (fight.redPoints > fight.bluePoints) {
    return 'RED'
  }
  if (fight.bluePoints > fight.redPoints) {
    return 'BLUE'
  }
  if (fight.senchu === 'RED') {
    return 'RED'
  }
  if (fight.senchu === 'BLUE') {
    return 'BLUE'
  }

  return tournamentType === 'GROUP' ? 'DRAW' : 'RED'
}

export const isFinal = (fight: Fight): boolean => fight.depth === 0 && fight.type === 'MAIN'

export const isSemifinal = (fight: Fight): boolean => fight.depth === 1 && fight.type === 'MAIN'

export const isRepechageFight = (fight: Fight): boolean => {
  return fight.type === 'REPECHAGE_1' || fight.type === 'REPECHAGE_2'
}

export const updateGroupTable = (group: Fight[][], result: FightResult): Fight[][] => {
  return group.map((row) => row.map((f) => {
    if (f.uuid === result.uuid) {
      return {
        ...f,
        ...result,
      }
    } else if (f.uuid === result.oppositeFight) {
      return {
        ...f,
        ...switchResultSides(result),
        // the mirror is its own fight and has to stay so: a result carries the uuid of the
        // cell it came from, and letting it through here gives both cells the same one -
        // after which saving the fight a second time matches both and the lower half of
        // the table keeps the corners of the upper one
        uuid: f.uuid,
        oppositeFight: f.oppositeFight,
      }
    } else {
      return f
    }
  }))
}

export type TournamentTreeNode = {
  name: string,
  attributes: {
    fight: Fight,
  },
  children: TournamentTreeNode[],
}

const newTree = (fight: Fight, children: TournamentTreeNode[]): TournamentTreeNode => {
  return {
    name: '',
    attributes: { fight },
    children,
  }
}

export const getTreeDepth = (tree: TournamentTreeNode | null): number => {
  if (!tree) {
    return -1
  }
  let depth = 0
  let cur = tree
  while (cur.children.length > 0) {
    depth++
    cur = cur.children[0]
  }
  return depth
}

export const findParentFightFor = (uuid: string, tree: TournamentTreeNode | null, depth?: number): Fight | null => {
  if (!tree || (!!depth && tree.attributes.fight.depth > depth)) {
    return null
  }

  if (tree.children[0]?.attributes.fight.uuid === uuid || tree.children[1]?.attributes.fight.uuid === uuid) {
    return tree.attributes.fight
  }

  const leftResult = findParentFightFor(uuid, tree.children[0] ?? null, depth)

  if (leftResult) {
    return leftResult
  }

  return findParentFightFor(uuid, tree.children[1] ?? null, depth)
}

export const createTournamentTree = (competitors: Competitor[], depth: number): TournamentTreeNode => {
  const [leftPool, rightPool] = split(competitors)

  let redUuid = ''
  let redName = ''
  let left: TournamentTreeNode | null = null
  let blueUuid = ''
  let blueName = ''
  let right: TournamentTreeNode | null = null

  if (leftPool.length === 1) {
    redUuid = leftPool[0].uuid
    redName = leftPool[0].name
  } else if (leftPool.length > 1) {
    left = createTournamentTree(leftPool, depth + 1)
  }

  if (rightPool.length === 1) {
    blueUuid = rightPool[0].uuid
    blueName = rightPool[0].name
  } else if (rightPool.length > 1) {
    right = createTournamentTree(rightPool, depth + 1)
  }

  const fight = newFight(redUuid, redName, blueUuid, blueName)
  fight.depth = depth

  const children = []
  if (left) {
    children.push(left)
  }
  if (right) {
    children.push(right)
  }

  return newTree(fight, children)
}

export const isValidTournamentTree = (x: any): x is TournamentTreeNode => {
  if (typeof x !== 'object') {
    return false
  }

  if (x === null) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.name === 'string') && (typeof x.attributes === 'object') && Array.isArray(x.children)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && isValidFight(x.attributes.fight)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (x.children.length < 1 || isValidTournamentTree(x.children[0]))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (x.children.length < 2 || isValidTournamentTree(x.children[1]))
}

export const updateTournamentTree = (
  node: TournamentTreeNode | null,
  result: FightResult,
  expectedType: FightType = 'MAIN',
): TournamentTreeNode | null => {
  if (node === null) {
    return null
  }

  if (result.type !== expectedType) {
    return node
  }

  if (node.attributes.fight.uuid === result.uuid) {
    return newTree({ ...node.attributes.fight, ...result }, node.children)
  }

  // the type has to travel down with the result: without it the children compare against
  // the default `MAIN` and a repechage fight below the root of its line quietly keeps
  // `0:0`, even though the winner it produced does reach the fight above it
  const left = updateTournamentTree(node.children[0] ?? null, result, expectedType)
  const right = updateTournamentTree(node.children[1] ?? null, result, expectedType)
  const fight = { ...node.attributes.fight }

  if (node.children.length >= 1 && node.children[0].attributes.fight.uuid === result.uuid) {
    const childFight = node.children[0].attributes.fight
    fight.redUuid = (result.winner === 'RED' ? childFight.redUuid : childFight.blueUuid)
    fight.redName = (result.winner === 'RED' ? childFight.redName : childFight.blueName)
  }
  if (node.children.length >= 2 && node.children[1].attributes.fight.uuid === result.uuid) {
    const childFight = node.children[1].attributes.fight
    fight.blueUuid = (result.winner === 'RED' ? childFight.redUuid : childFight.blueUuid)
    fight.blueName = (result.winner === 'RED' ? childFight.redName : childFight.blueName)
  }

  const children = arrayOfDefined(left, right)

  return newTree(fight, children)
}

/** Which repechage line a semifinal feeds, or null where the fight feeds none. */
const repechageLineOf = (fight: Fight, tree: TournamentTreeNode): FightType | null => {
  if (tree.children[0]?.attributes.fight.uuid === fight.uuid) {
    return 'REPECHAGE_1'
  }
  if (tree.children[1]?.attributes.fight.uuid === fight.uuid) {
    return 'REPECHAGE_2'
  }
  return null
}

/**
 * Whether reopening this fight throws a repechage line away.
 *
 * Reopening a semifinal builds its line again out of the new result, so whatever was played
 * in the old one is gone - which is what the app asks about before letting it happen. Where
 * there is no line, there is nothing to ask: a bracket of four gives its semifinalists
 * nobody to bring back, and a question with nothing behind it is the kind people learn to
 * click through on their way to the ones that matter.
 */
export const resetsRepechage = (
  fight: Fight,
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null,
): boolean => {
  if (!isSemifinal(fight) || tree === null || repechage === null) {
    return false
  }

  const line = repechageLineOf(fight, tree)

  return line !== null && repechage.children.some((c) => c.attributes.fight.type === line)
}

export const needsConfirmationToReopen = (
  fight: Fight,
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null,
): boolean => {
  // final is the last fight and so it can be reopened
  if (isFinal(fight)) {
    return false
  }
  // a semifinal whose repechage line would be thrown away needs confirmation
  if (resetsRepechage(fight, tree, repechage)) {
    return true
  }
  // A repechage line is a bracket of its own and is not in the main tree at all, so its
  // fights are looked up there - and without the depth cut-off, which exists to stop the
  // search in a bracket where depth means something. Every fight in a line carries zero.
  const parentFight = isRepechageFight(fight)
    ? findParentFightFor(fight.uuid, repechage)
    : findParentFightFor(fight.uuid, tree, fight.depth - 1)

  // if the subsequent fight is finished it needs confirmation
  return parentFight?.winner !== undefined
}

export type OpenFightAction = 'NOTHING' | 'OPEN' | 'ASK'

/**
 * What pressing a fight in the bracket should do.
 *
 * The rule lives here rather than in the screen because the screen cannot be tested:
 * `react-d3-tree` reads the size of a laid out `<svg>` and jsdom lays nothing out, so
 * anything decided inside that component is decided where no test can reach it.
 */
export const openFightAction = (
  fight: Fight,
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null,
): OpenFightAction => {
  // half of a pairing is still to be decided, so there is no fight to open yet
  if (fight.redUuid === '' || fight.blueUuid === '') {
    return 'NOTHING'
  }

  if (fight.winner === undefined) {
    return 'OPEN'
  }

  return needsConfirmationToReopen(fight, tree, repechage) ? 'ASK' : 'OPEN'
}

/**
 * Saves opponents of the given fighter in the tree from the last one to the first one.
 */
const saveOpponentsOf = (fighterUuid: string, tree: TournamentTreeNode, opponents: Competitor[]): void => {
  if (tree.attributes.fight.redUuid === fighterUuid) {
    opponents.push({ uuid: tree.attributes.fight.blueUuid, name: tree.attributes.fight.blueName })
    if (tree.children.length > 0) {
      saveOpponentsOf(fighterUuid, tree.children[0], opponents)
    }
  }
  if (tree.attributes.fight.blueUuid === fighterUuid) {
    opponents.push({ uuid: tree.attributes.fight.redUuid, name: tree.attributes.fight.redName })
    if (tree.children.length > 1) {
      saveOpponentsOf(fighterUuid, tree.children[1], opponents)
    }
  }
}

const createRepechageLine = (
  fighters: Competitor[],
  type: 'REPECHAGE_1' | 'REPECHAGE_2',
): TournamentTreeNode | null => {
  if (fighters.length === 1) {
    return null
  }

  if (fighters.length === 2) {
    const red = fighters[1]
    const blue = fighters[0]
    return newTree(newFight(red.uuid, red.name, blue.uuid, blue.name, type), [])
  }

  return newTree(
    newFight('', '', fighters[0].uuid, fighters[0].name, type),
    // recursive call of createRepechageLine cannot return null -> retype
    [createRepechageLine(fighters.slice(1), type) as TournamentTreeNode],
  )
}

/** Index n is the line the n-th semifinal feeds, and the order the two are kept in. */
const REPECHAGE_LINES = ['REPECHAGE_1', 'REPECHAGE_2'] as const

type RepechageLine = typeof REPECHAGE_LINES[number]

const lineOf = (tree: TournamentTreeNode | null, line: RepechageLine): TournamentTreeNode | undefined => {
  return tree?.children.find((c) => c.attributes.fight.type === line)
}

/**
 * The children of a repechage root: one line replaced by a freshly computed one, the other
 * carried over untouched, both in line order. Either may be missing - a line with a single
 * fighter left in it has no fight to hold - and a root with no children at all is no root.
 */
const repechageChildren = (
  repechageTree: TournamentTreeNode | null,
  replaced: RepechageLine,
  replacement: TournamentTreeNode | null,
): TournamentTreeNode[] => {
  return arrayOfDefined(...REPECHAGE_LINES.map(
    (line) => line === replaced ? replacement : lineOf(repechageTree, line),
  ))
}

export const updateRepechageTree = (
  tournamentTree: TournamentTreeNode | null,
  repechageTree: TournamentTreeNode | null,
  result: FightResult,
): TournamentTreeNode | null => {
  if (!tournamentTree) {
    return null
  }

  // a semifinal result rebuilds the line it feeds out of everyone its winner beat,
  // and leaves whatever the other semifinal has already produced alone
  if (result.type === 'MAIN') {
    const semifinals = tournamentTree.children

    for (const [index, line] of REPECHAGE_LINES.entries()) {
      if (semifinals.length <= index || result.uuid !== semifinals[index].attributes.fight.uuid) {
        continue
      }

      const semifinal = semifinals[index].attributes.fight
      const winnerUuid = result.winner === 'RED' ? semifinal.redUuid : semifinal.blueUuid
      const opponents: Competitor[] = []
      saveOpponentsOf(winnerUuid, semifinals[index], opponents)

      const children = repechageChildren(repechageTree, line, createRepechageLine(opponents, line))

      return children.length === 0 ? null : newTree(newFight('', '', '', '', 'REPECHAGE_ROOT'), children)
    }
  }

  // a repechage result advances its own line and leaves the other one as it is
  if (!!repechageTree && (result.type === 'REPECHAGE_1' || result.type === 'REPECHAGE_2')) {
    const advanced = updateTournamentTree(lineOf(repechageTree, result.type) ?? null, result, result.type)

    return newTree(repechageTree.attributes.fight, repechageChildren(repechageTree, result.type, advanced))
  }

  return repechageTree
}

export const createGroup = (competitors: Competitor[]): Fight[][] => {
  const fights: Fight[][] = []

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < competitors.length; ++i) {
    const row: Fight[] = []
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let j = 0; j < competitors.length; ++j) {
      const fight = newFight(competitors[i].uuid, competitors[i].name, competitors[j].uuid, competitors[j].name)
      row.push(fight)
    }
    fights.push(row)
  }


  for (let i = 0; i < competitors.length; ++i) {

    for (let j = 0; j < competitors.length; ++j) {
      fights[i][j].oppositeFight = fights[j][i].uuid
    }
  }

  return fights
}
