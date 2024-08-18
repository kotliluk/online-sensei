import { v4 as uuidV4 } from 'uuid'
import { split } from '../utils/array'
import { Senchu } from './senchu'


export type TournamentType = 'TREE' | 'GROUP'

export type Competitor = {
  uuid: string,
  name: string,
  result: number,
}

export const newCompetitor = (name = ''): Competitor => ({
  uuid: uuidV4(),
  name,
  result: -1,
})

export const isValidCompetitor = (x: any): boolean => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.uuid === 'string') && (typeof x.name === 'string') && (typeof x.result === 'number')
}

export type FightWinner = 'BLUE' | 'RED' | 'DRAW'

export type Fight = {
  uuid: string,
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
  winnerGoesTo: string | undefined,
  oppositeFight: string | undefined,
}

export type FightResult = {
  uuid: string,
  winner: FightWinner,
  redPoints: number,
  redFouls: number,
  bluePoints: number,
  blueFouls: number,
  senchu: Senchu,
  winnerGoesTo: string | undefined,
  oppositeFight: string | undefined,
}

export const switchResultSides = (fight: FightResult): FightResult => {
  return {
    uuid: fight.uuid,
    winner: (fight.winner === 'RED' ? 'BLUE' : (fight.winner === 'BLUE' ? 'RED' : 'DRAW')),
    redPoints: fight.bluePoints,
    redFouls: fight.blueFouls,
    bluePoints: fight.redPoints,
    blueFouls: fight.redFouls,
    senchu: (fight.senchu === 'RED' ? 'BLUE' : (fight.senchu === 'BLUE' ? 'RED' : 'NONE')),
    winnerGoesTo: fight.winnerGoesTo,
    oppositeFight: fight.oppositeFight,
  }
}

export const newFight = (redUuid: string, redName: string, blueUuid: string, blueName: string): Fight => ({
  uuid: uuidV4(),
  depth: 0,
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
  winnerGoesTo: undefined,
  oppositeFight: undefined,
})

export const isValidFight = (x: any): boolean => {
  if (typeof x !== 'object') {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (typeof x.uuid === 'string') && (typeof x.depth === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.winner === 'undefined' || typeof x.winner === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,max-len
    && (typeof x.redUuid === 'string') && (typeof x.redName === 'string') && (typeof x.redPoints === 'number') && (typeof x.redSenchu === 'boolean') && (typeof x.redFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,max-len
    && (typeof x.blueUuid === 'string') && (typeof x.blueName === 'string') && (typeof x.bluePoints === 'number') && (typeof x.blueSenchu === 'boolean') && (typeof x.blueFouls === 'number')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.winnerGoesTo === 'undefined' || typeof x.winnerGoesTo === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    && (typeof x.oppositeFight === 'undefined' || typeof x.oppositeFight === 'string')
}

export type TournamentTreeNode = {
  fight: Fight,
  left: TournamentTreeNode | null,
  right: TournamentTreeNode | null,
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

  if (left) {
    left.fight.winnerGoesTo = fight.uuid
  }
  if (right) {
    right.fight.winnerGoesTo = fight.uuid
  }

  return {
    fight,
    left,
    right,
  }
}

export const isValidTournamentTree = (x: any): boolean => {
  if (typeof x !== 'object') {
    return false
  }

  if (x === null) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return isValidFight(x.fight) && (isValidTournamentTree(x.left)) && (isValidTournamentTree(x.right))
}

export const updateTournamentTree = (
  node: TournamentTreeNode | null,
  result: FightResult,
): TournamentTreeNode | null => {
  if (node === null) {
    return null
  }

  if (node.fight.uuid === result.uuid) {
    return {
      fight: {
        ...node.fight,
        ...result,
      },
      left: node.left,
      right: node.right,
    }
  }

  const left = updateTournamentTree(node.left, result)
  const right = updateTournamentTree(node.right, result)
  const fight = node.fight

  if (node.left !== null && node.left.fight.uuid === result.uuid) {
    fight.redUuid = (result.winner === 'RED' ? node.left.fight.redUuid : node.left.fight.blueUuid)
    fight.redName = (result.winner === 'RED' ? node.left.fight.redName : node.left.fight.blueName)
  }
  if (node.right !== null && node.right.fight.uuid === result.uuid) {
    fight.redUuid = (result.winner === 'RED' ? node.right.fight.redUuid : node.right.fight.blueUuid)
    fight.redName = (result.winner === 'RED' ? node.right.fight.redName : node.right.fight.blueName)
  }

  return {
    fight: { ...fight },
    left,
    right,
  }
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
