import { vi } from 'vitest'
import {
  Competitor, createTournamentTree, Fight, FightResult, groupRowStats, switchResultSides,
  defaultWinner, TournamentTreeNode, updateGroupTable, updateTournamentTree,
} from '../tournament'
import { FightLogEntry } from '../fightLog'


vi.mock('uuid', () => ({ v4: () => 'mocked-uuid-v4' }))

const competitor = (name: string): Competitor => ({
  uuid: name,
  name,
})

const fight = (red: string, blue: string, depth = 0): Fight => ({
  uuid: 'mocked-uuid-v4',
  type: 'MAIN',
  depth,
  winner: undefined,
  redUuid: red,
  redName: red,
  redPoints: 0,
  redFouls: 0,
  blueUuid: blue,
  blueName: blue,
  bluePoints: 0,
  blueFouls: 0,
  senchu: 'NONE',
  oppositeFight: undefined,
  log: [],
})

describe('createTournamentTree', () => {
  test.each([
    {
      competitors: [competitor('1')],
      expected: {
        name: '',
        attributes: { fight: fight('1', '') },
        children: [],
      },
    },
    {
      competitors: [competitor('1'), competitor('2')],
      expected: {
        name: '',
        attributes: { fight: fight('1', '2') },
        children: [],
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3')],
      expected: {
        name: '',
        attributes: { fight: fight('', '3') },
        children: [
          {
            name: '',
            attributes: { fight: fight('1', '2', 1) },
            children: [],
          },
        ],
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4')],
      expected: {
        name: '',
        attributes: { fight: fight('', '') },
        children: [
          {
            name: '',
            attributes: { fight: fight('1', '2', 1) },
            children: [],
          },
          {
            name: '',
            attributes: { fight: fight('3', '4', 1) },
            children: [],
          },
        ],
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4'), competitor('5')],
      expected: {
        name: '',
        attributes: { fight: fight('', '') },
        children: [
          {
            name: '',
            attributes: { fight: fight('', '3', 1) },
            children: [
              {
                name: '',
                attributes: { fight: fight('1', '2', 2) },
                children: [],
              },
            ],
          },
          {
            name: '',
            attributes: { fight: fight('4', '5', 1) },
            children: [],
          },
        ],
      },
    },
  ])('%s', ({ competitors, expected }) => {
    // act
    const actual = createTournamentTree(competitors, 0)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

describe('groupRowStats', () => {
  const played = (blue: string, winner: Fight['winner'], red: number, blueScore: number): Fight => ({
    ...fight('Aneta', blue),
    winner,
    redPoints: red,
    bluePoints: blueScore,
  })

  test('counts the row from its own fighter point of view', () => {
    // arrange - the row of Aneta: a win, a loss, a draw and her own diagonal cell
    const row = [
      fight('Aneta', 'Aneta'),
      played('Bob', 'RED', 4, 1),
      played('Cyril', 'BLUE', 2, 5),
      played('Dana', 'DRAW', 3, 3),
    ]
    // act
    const stats = groupRowStats(row)
    // assert
    expect(stats).toEqual({ wins: 1, draws: 1, losses: 1, plusPoints: 9, minusPoints: 9 })
  })

  test('counts an unplayed fight as nothing at all', () => {
    // arrange
    const row = [fight('Aneta', 'Aneta'), fight('Aneta', 'Bob')]
    // act
    const stats = groupRowStats(row)
    // assert
    expect(stats).toEqual({ wins: 0, draws: 0, losses: 0, plusPoints: 0, minusPoints: 0 })
  })
})

describe('switchResultSides', () => {
  const log: FightLogEntry[] = [
    { at: 1, fightTime: 120, event: { kind: 'POINTS', side: 'RED', delta: 3 } },
    { at: 2, fightTime: 110, event: { kind: 'FOULS', side: 'RED', from: 0, to: 1 } },
    { at: 3, fightTime: 100, event: { kind: 'SENCHU', from: 'NONE', to: 'BLUE' } },
    { at: 4, fightTime: 90, event: { kind: 'PAUSE' } },
  ]

  const result: FightResult = {
    uuid: 'f1',
    type: 'MAIN',
    winner: 'RED',
    redPoints: 3,
    redFouls: 1,
    bluePoints: 1,
    blueFouls: 0,
    senchu: 'BLUE',
    oppositeFight: 'f2',
    log,
  }

  test('mirrors the score, the fouls, senchu and the winner', () => {
    // act
    const actual = switchResultSides(result)
    // assert
    expect(actual).toMatchObject({
      winner: 'BLUE',
      redPoints: 1,
      redFouls: 0,
      bluePoints: 3,
      blueFouls: 1,
      senchu: 'RED',
      uuid: 'f1',
      oppositeFight: 'f2',
    })
  })

  test('mirrors the log along with it, so the cell does not credit the wrong fighter', () => {
    // act
    const actual = switchResultSides(result)
    // assert
    expect(actual.log.map((entry) => entry.event)).toEqual([
      { kind: 'POINTS', side: 'BLUE', delta: 3 },
      { kind: 'FOULS', side: 'BLUE', from: 0, to: 1 },
      { kind: 'SENCHU', from: 'NONE', to: 'RED' },
      { kind: 'PAUSE' },
    ])
  })

  test('leaves the result it was given untouched', () => {
    // act
    switchResultSides(result)
    // assert
    expect(result.log[0].event).toEqual({ kind: 'POINTS', side: 'RED', delta: 3 })
    expect(result.senchu).toBe('BLUE')
  })
})

/**
 * A group table lists every fight twice - once in each competitor's row, with the corners
 * the other way round. The two cells are different fights that mirror one result, so they
 * have to keep their own identities.
 */
const groupOfTwo = (): Fight[][] => {
  const upper: Fight = { ...fight('Aneta', 'Bob'), uuid: 'upper', oppositeFight: 'lower' }
  const lower: Fight = { ...fight('Bob', 'Aneta'), uuid: 'lower', oppositeFight: 'upper' }
  const self = (name: string): Fight => ({ ...fight(name, name), uuid: `self-${name}` })

  return [
    [self('Aneta'), upper],
    [lower, self('Bob')],
  ]
}

const resultOf = (f: Fight, redPoints: number, bluePoints: number): FightResult => ({
  uuid: f.uuid,
  type: f.type,
  winner: redPoints > bluePoints ? 'RED' : (bluePoints > redPoints ? 'BLUE' : 'DRAW'),
  redPoints,
  redFouls: 0,
  bluePoints,
  blueFouls: 0,
  senchu: 'NONE',
  oppositeFight: f.oppositeFight,
  log: [],
})

describe('updateGroupTable', () => {
  test('writes the result into the fight and its mirror with the corners swapped', () => {
    // arrange
    const group = groupOfTwo()
    // act - Aneta beats Bob 3:1
    const updated = updateGroupTable(group, resultOf(group[0][1], 3, 1))
    // assert
    expect(updated[0][1]).toMatchObject({ redPoints: 3, bluePoints: 1, winner: 'RED' })
    expect(updated[1][0]).toMatchObject({ redPoints: 1, bluePoints: 3, winner: 'BLUE' })
  })

  test('leaves both cells their own identity, so the fight can be reopened', () => {
    // arrange
    const group = groupOfTwo()
    // act
    const updated = updateGroupTable(group, resultOf(group[0][1], 3, 1))
    // assert - taking the mirror's uuid from the result would make the next save hit both
    expect(updated[1][0].uuid).toBe('lower')
    expect(updated[1][0].oppositeFight).toBe('upper')
  })

  test('a reopened fight saved the other way round still mirrors correctly', () => {
    // arrange - played 3:1 for Aneta, then reopened and corrected to 1:5 for Bob
    const group = updateGroupTable(groupOfTwo(), resultOf(groupOfTwo()[0][1], 3, 1))
    // act
    const corrected = updateGroupTable(group, resultOf(group[0][1], 1, 5))
    // assert
    expect(corrected[0][1]).toMatchObject({ redPoints: 1, bluePoints: 5, winner: 'BLUE' })
    expect(corrected[1][0]).toMatchObject({ redPoints: 5, bluePoints: 1, winner: 'RED' })
  })

  test('the winner of a reopened fight has a win, not a second loss', () => {
    // arrange - the group standings are read off whole rows, so a mirror that keeps the
    // original corners gives both competitors a loss and nobody a win
    const group = updateGroupTable(groupOfTwo(), resultOf(groupOfTwo()[0][1], 3, 1))
    // act
    const corrected = updateGroupTable(group, resultOf(group[0][1], 1, 5))
    // assert
    expect(groupRowStats(corrected[0])).toMatchObject({ wins: 0, losses: 1 })
    expect(groupRowStats(corrected[1])).toMatchObject({ wins: 1, losses: 0 })
  })
})

/**
 * A repechage line is a tree of its own, and its fights are typed `REPECHAGE_1` /
 * `REPECHAGE_2` so a result cannot land in the main bracket by accident.
 */
const repechageNode = (f: Fight, children: TournamentTreeNode[] = []): TournamentTreeNode => ({
  name: '',
  attributes: { fight: f },
  children,
})

const repechageFight = (red: string, blue: string, uuid: string): Fight => ({
  ...fight(red, blue),
  uuid,
  type: 'REPECHAGE_1',
})

describe('updateTournamentTree', () => {
  test('saves a result into the root of the line', () => {
    // arrange
    const root = repechageFight('C3', 'C5', 'root')
    const tree = repechageNode(root)
    // act
    const updated = updateTournamentTree(tree, resultOf(root, 7, 1), 'REPECHAGE_1')
    // assert
    expect(updated?.attributes.fight).toMatchObject({ redPoints: 7, bluePoints: 1, winner: 'RED' })
  })

  test('saves a result into a fight deeper than the root of the line', () => {
    // arrange - from about nine competitors up, a repechage line is two fights deep
    const deeper = repechageFight('C2', 'C3', 'deeper')
    const root = repechageFight('', 'C5', 'root')
    const tree = repechageNode(root, [repechageNode(deeper)])
    // act - C3 wins the deeper fight 1:7
    const updated = updateTournamentTree(tree, resultOf(deeper, 1, 7), 'REPECHAGE_1')
    // assert - the fight itself has to keep the result, not just feed the one above it
    expect(updated?.children[0].attributes.fight).toMatchObject({
      redPoints: 1, bluePoints: 7, winner: 'BLUE',
    })
  })

  test('feeds the winner of a deeper fight into the one above it', () => {
    // arrange
    const deeper = repechageFight('C2', 'C3', 'deeper')
    const root = repechageFight('', 'C5', 'root')
    const tree = repechageNode(root, [repechageNode(deeper)])
    // act
    const updated = updateTournamentTree(tree, resultOf(deeper, 1, 7), 'REPECHAGE_1')
    // assert
    expect(updated?.attributes.fight).toMatchObject({ redUuid: 'C3', redName: 'C3' })
  })

  test('a result of another type is left alone at every depth', () => {
    // arrange - a main-bracket result must not land in the repechage line
    const deeper = repechageFight('C2', 'C3', 'deeper')
    const tree = repechageNode(repechageFight('', 'C5', 'root'), [repechageNode(deeper)])
    // act
    const updated = updateTournamentTree(tree, resultOf(deeper, 1, 7), 'MAIN')
    // assert
    expect(updated?.children[0].attributes.fight.winner).toBeUndefined()
  })
})

describe('defaultWinner', () => {
  const scored = (
    redPoints: number, bluePoints: number, senchu: Fight['senchu'] = 'NONE',
    redFouls = 0, blueFouls = 0,
  ): Fight => ({ ...fight('Aneta', 'Bob'), redPoints, bluePoints, senchu, redFouls, blueFouls })

  test.each([
    { label: 'more points for aka', f: scored(5, 3), type: 'TREE' as const, expected: 'RED' },
    { label: 'more points for ao', f: scored(3, 5), type: 'TREE' as const, expected: 'BLUE' },
    { label: 'five fouls on aka', f: scored(8, 0, 'NONE', 5, 0), type: 'TREE' as const, expected: 'BLUE' },
    { label: 'five fouls on ao', f: scored(0, 8, 'NONE', 0, 5), type: 'TREE' as const, expected: 'RED' },
    { label: 'level, senchu aka', f: scored(2, 2, 'RED'), type: 'TREE' as const, expected: 'RED' },
    { label: 'level, senchu ao', f: scored(2, 2, 'BLUE'), type: 'TREE' as const, expected: 'BLUE' },
    { label: 'level, no senchu, group', f: scored(2, 2), type: 'GROUP' as const, expected: 'DRAW' },
    { label: 'level, no senchu, tree', f: scored(2, 2), type: 'TREE' as const, expected: 'RED' },
    { label: 'senchu ao beats a group draw', f: scored(0, 0, 'BLUE'), type: 'GROUP' as const, expected: 'BLUE' },
  ])('$label -> $expected', ({ f, type, expected }) => {
    // act + assert
    expect(defaultWinner(f, type)).toBe(expected)
  })

  test('fouls outrank points', () => {
    // arrange - eight points and five fouls still loses
    // act + assert
    expect(defaultWinner(scored(8, 0, 'NONE', 5, 0), 'TREE')).toBe('BLUE')
  })

  test('points outrank senchu', () => {
    // act + assert
    expect(defaultWinner(scored(5, 3, 'BLUE'), 'TREE')).toBe('RED')
  })
})
