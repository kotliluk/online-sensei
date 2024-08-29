import { v4 as uuidV4 } from 'uuid'
import { arrayOfDefined, split } from '../utils/array'
import { Senchu } from './senchu'


export type TournamentType = 'TREE' | 'GROUP'

export type Competitor = {
  uuid: string,
  name: string,
}

export const newCompetitor = (name = ''): Competitor => ({
  uuid: uuidV4(),
  name,
})

export const isValidCompetitor = (x: any): boolean => {
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
}

export const switchResultSides = (fight: FightResult): FightResult => {
  return {
    uuid: fight.uuid,
    type: fight.type,
    winner: (fight.winner === 'RED' ? 'BLUE' : (fight.winner === 'BLUE' ? 'RED' : 'DRAW')),
    redPoints: fight.bluePoints,
    redFouls: fight.blueFouls,
    bluePoints: fight.redPoints,
    blueFouls: fight.redFouls,
    senchu: (fight.senchu === 'RED' ? 'BLUE' : (fight.senchu === 'BLUE' ? 'RED' : 'NONE')),
    oppositeFight: fight.oppositeFight,
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
})

export const isValidFight = (x: any): boolean => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.uuid === 'string') && (typeof x.depth === 'number') && (typeof x.type === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.winner === 'undefined' || typeof x.winner === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,max-len
    && (typeof x.redUuid === 'string') && (typeof x.redName === 'string') && (typeof x.redPoints === 'number') && (typeof x.redFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,max-len
    && (typeof x.blueUuid === 'string') && (typeof x.blueName === 'string') && (typeof x.bluePoints === 'number') && (typeof x.blueFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.senchu === 'string') && (x.senchu === 'RED' || x.senchu === 'BLUE' || x.senchu === 'NONE')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.oppositeFight === 'undefined' || typeof x.oppositeFight === 'string')
}

export const isFinal = (fight: Fight): boolean => fight.depth === 0 && fight.type === 'MAIN'

export const isSemifinal = (fight: Fight): boolean => fight.depth === 1 && fight.type === 'MAIN'

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

export const isValidTournamentTree = (x: any): boolean => {
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

  const left = updateTournamentTree(node.children[0] ?? null, result)
  const right = updateTournamentTree(node.children[1] ?? null, result)
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

export const needsConfirmationToReopen = (fight: Fight, tree: TournamentTreeNode | null): boolean => {
  // final is the last fight and so it can be reopened
  if (isFinal(fight)) {
    return false
  }
  // semifinal influences repechage fights and it needs confirmation
  if (isSemifinal(fight)) {
    return true
  }
  const parentFight = findParentFightFor(fight.uuid, tree, fight.depth - 1)
  // if the subsequent fight is finished it needs confirmation
  return parentFight?.winner !== undefined
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
    newFight(
      '',
      '',
      fighters[0].uuid, fighters[0].name, type),
      // recursive call cannot return null
      [createRepechageLine(fighters.slice(1), type) as TournamentTreeNode],
  )
}

export const updateRepechageTree = (
  tournamentTree: TournamentTreeNode | null,
  repechageTree: TournamentTreeNode | null,
  result: FightResult,
): TournamentTreeNode | null => {
  if (!tournamentTree) {
    return null
  }

  // result from the main tree
  if (result.type === 'MAIN') {
    // result of first semifinal - creates repechage 1
    if (tournamentTree.children.length > 0 && result.uuid === tournamentTree.children[0].attributes.fight.uuid) {
      const semifinal = tournamentTree.children[0].attributes.fight
      const winnerUuid = result.winner === 'RED' ? semifinal.redUuid : semifinal.blueUuid
      const opponents: Competitor[] = []
      saveOpponentsOf(winnerUuid, tournamentTree.children[0], opponents)

      const repechage1 = createRepechageLine(opponents, 'REPECHAGE_1')
      const repechage2 = repechageTree?.children.find((c) => c.attributes.fight.type === 'REPECHAGE_2')
      const children = arrayOfDefined(repechage1, repechage2)
      return newTree(newFight('', '', '', '', 'REPECHAGE_ROOT'), children)
    }

    // result of second semifinal - creates repechage 2
    if (tournamentTree.children.length > 1 && result.uuid === tournamentTree.children[1].attributes.fight.uuid) {
      const semifinal = tournamentTree.children[1].attributes.fight
      const winnerUuid = result.winner === 'RED' ? semifinal.redUuid : semifinal.blueUuid
      const opponents: Competitor[] = []
      saveOpponentsOf(winnerUuid, tournamentTree.children[1], opponents)

      const repechage1 = repechageTree?.children.find((c) => c.attributes.fight.type === 'REPECHAGE_1')
      const repechage2 = createRepechageLine(opponents, 'REPECHAGE_2')
      const children = arrayOfDefined(repechage1, repechage2)
      return newTree(newFight('', '', '', '', 'REPECHAGE_ROOT'), children)
    }
  }

  // result from the repechage 1 - updates
  if (!!repechageTree && result.type === 'REPECHAGE_1') {
    const repechage1 = repechageTree.children.find((c) => c.attributes.fight.type === 'REPECHAGE_1') ?? null
    const repechage2 = repechageTree.children.find((c) => c.attributes.fight.type === 'REPECHAGE_2')
    const updated1 = updateTournamentTree(repechage1, result, 'REPECHAGE_1')
    const children = arrayOfDefined(updated1, repechage2)
    return newTree(repechageTree.attributes.fight, children)
  }

  // result from the repechage 2 - updates
  if (!!repechageTree && result.type === 'REPECHAGE_2') {
    const repechage1 = repechageTree.children.find((c) => c.attributes.fight.type === 'REPECHAGE_1')
    const repechage2 = repechageTree.children.find((c) => c.attributes.fight.type === 'REPECHAGE_2') ?? null
    const updated2 = updateTournamentTree(repechage2, result, 'REPECHAGE_2')
    const children = arrayOfDefined(repechage1, updated2)
    return newTree(repechageTree.attributes.fight, children)
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

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < competitors.length; ++i) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let j = 0; j < competitors.length; ++j) {
      fights[i][j].oppositeFight = fights[j][i].uuid
    }
  }

  return fights
}
