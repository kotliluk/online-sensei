import { vi } from 'vitest'
import {
  Competitor, createTournamentTree, Fight, FightResult, groupRowStats, switchResultSides,
  defaultWinner, isValidFight, needsConfirmationToReopen, openFightAction, resetsRepechage,
  TournamentTreeNode, updateGroupTable, updateRepechageTree, updateTournamentTree,
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

/**
 * Eight competitors, quarterfinals behind them: A beat X and B beat Y, so A meets B in the
 * first semifinal; C beat Z and D beat W in the other half. Written out by hand rather than
 * built with `createTournamentTree`, because the uuid module is mocked to one constant at
 * the top of this file and everything in here is found by uuid.
 */
const mainFight = (red: string, blue: string, uuid: string, depth: number): Fight => ({
  ...fight(red, blue, depth),
  uuid,
})

const node = (f: Fight, children: TournamentTreeNode[] = []): TournamentTreeNode => ({
  name: '',
  attributes: { fight: f },
  children,
})

/** Four competitors: the semifinals are the first fights there are. */
const bracketOfFour = (): TournamentTreeNode => node(
  mainFight('', '', 'final', 0),
  [
    node(mainFight('A', 'B', 'semi1', 1)),
    node(mainFight('C', 'D', 'semi2', 1)),
  ],
)

/**
 * Sixteen competitors, three rounds behind them: A beat P, then X, then B in the semifinal.
 * A repechage line only recurses from here up - with eight it is a single fight, so the
 * branch that stacks the earlier losers underneath never runs.
 */
const bracketOfSixteen = (): TournamentTreeNode => node(
  mainFight('', '', 'final', 0),
  [
    node(mainFight('A', 'B', 'semi1', 1), [
      node(mainFight('A', 'X', 'q1', 2), [
        node(mainFight('A', 'P', 'r1', 3)),
        node(mainFight('X', 'Q', 'r2', 3)),
      ]),
      node(mainFight('B', 'Y', 'q2', 2), [
        node(mainFight('B', 'R', 'r3', 3)),
        node(mainFight('Y', 'S', 'r4', 3)),
      ]),
    ]),
    node(mainFight('C', 'D', 'semi2', 1), [
      node(mainFight('C', 'Z', 'q3', 2)),
      node(mainFight('D', 'W', 'q4', 2)),
    ]),
  ],
)

const bracketOfEight = (): TournamentTreeNode => node(
  mainFight('', '', 'final', 0),
  [
    node(mainFight('A', 'B', 'semi1', 1), [
      node(mainFight('A', 'X', 'q1', 2)),
      node(mainFight('B', 'Y', 'q2', 2)),
    ]),
    node(mainFight('C', 'D', 'semi2', 1), [
      node(mainFight('C', 'Z', 'q3', 2)),
      node(mainFight('D', 'W', 'q4', 2)),
    ]),
  ],
)

const findFight = (tree: TournamentTreeNode, uuid: string): Fight | undefined => {
  if (tree.attributes.fight.uuid === uuid) {
    return tree.attributes.fight
  }

  for (const child of tree.children) {
    const found = findFight(child, uuid)
    if (found !== undefined) {
      return found
    }
  }

  return undefined
}

const fightIn = (tree: TournamentTreeNode, uuid: string): Fight => findFight(tree, uuid) as Fight

/**
 * Repechage is what makes this an official competition type rather than a knockout: whoever
 * lost to a finalist gets another way through, and the line is built out of exactly the
 * people that finalist beat on the way. It is computed the moment a semifinal is decided,
 * so nobody enters it by hand and nothing here is checked by eye at the table.
 */
describe('updateRepechageTree', () => {
  test('builds the first line out of the people the first semifinalist beat', () => {
    // arrange - A wins the first semifinal, having beaten X in the quarterfinal
    const tree = bracketOfEight()
    // act
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    // assert - B, who just lost to A, comes back against X, who lost to A before that
    expect(repechage?.attributes.fight.type).toBe('REPECHAGE_ROOT')
    expect(repechage?.children).toHaveLength(1)
    expect(repechage?.children[0].attributes.fight).toMatchObject({
      type: 'REPECHAGE_1', redName: 'X', blueName: 'B',
    })
  })

  test('builds the second line without touching the first', () => {
    // arrange - the first semifinal is already behind us
    const tree = bracketOfEight()
    const first = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    // act - and now the second one
    const both = updateRepechageTree(tree, first, resultOf(fightIn(tree, 'semi2'), 5, 0))
    // assert
    expect(both?.children.map((c) => c.attributes.fight.type)).toEqual(['REPECHAGE_1', 'REPECHAGE_2'])
    expect(both?.children[1].attributes.fight).toMatchObject({ redName: 'Z', blueName: 'D' })
  })

  test('saves a repechage result into the line it came from', () => {
    // arrange
    const tree = bracketOfEight()
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    const line = (repechage as TournamentTreeNode).children[0].attributes.fight
    // act - X takes it 3:1
    const updated = updateRepechageTree(tree, repechage, resultOf(line, 3, 1))
    // assert
    expect(updated?.children[0].attributes.fight).toMatchObject({
      redPoints: 3, bluePoints: 1, winner: 'RED',
    })
  })

  /**
   * From sixteen competitors up, a line is a line rather than a single fight: the people
   * knocked out earliest fight each other at the bottom and the semifinal loser waits at
   * the top, the same shape as the main bracket. Everything below the top fight of the line
   * lives in the branch that only runs at this size.
   */
  test('stacks the earlier losers underneath the semifinal loser', () => {
    // arrange - A beat P, then X, then B
    const tree = bracketOfSixteen()
    // act
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    const line = repechage?.children[0]
    // assert - B waits at the top with nobody opposite yet, P and X fight for the place
    expect(line?.attributes.fight).toMatchObject({ redName: '', blueName: 'B' })
    expect(line?.children).toHaveLength(1)
    expect(line?.children[0].attributes.fight).toMatchObject({ redName: 'P', blueName: 'X' })
  })

  test('saves a result into the fight at the bottom of a stacked line', () => {
    // arrange - the line has the shape the test above proves it is built with, written out
    // by hand so its two fights have identities of their own: the uuid module is mocked to
    // one constant in this file, and a line built here would be two fights with one uuid
    const tree = bracketOfSixteen()
    const bottom = repechageFight('P', 'X', 'line-bottom')
    const repechage = node(
      { ...mainFight('', '', 'rep-root', 0), type: 'REPECHAGE_ROOT' },
      [node(repechageFight('', 'B', 'line-top'), [node(bottom)])],
    )
    // act - X takes it 1:4
    const updated = updateRepechageTree(tree, repechage, resultOf(bottom, 1, 4))
    // assert - the fight keeps the result, and its winner reaches the one above it
    expect(updated?.children[0].children[0].attributes.fight).toMatchObject({
      redPoints: 1, bluePoints: 4, winner: 'BLUE',
    })
    expect(updated?.children[0].attributes.fight).toMatchObject({ redName: 'X' })
  })

  test('saves a result into the second line as well as the first', () => {
    // arrange - both lines exist
    const tree = bracketOfEight()
    const first = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    const both = updateRepechageTree(tree, first, resultOf(fightIn(tree, 'semi2'), 5, 0)) as TournamentTreeNode
    const secondLine = both.children[1].attributes.fight
    // act
    const updated = updateRepechageTree(tree, both, resultOf(secondLine, 6, 2))
    // assert
    expect(updated?.children[1].attributes.fight).toMatchObject({
      redPoints: 6, bluePoints: 2, winner: 'RED',
    })
  })

  test('leaves the other line alone when one of them is played', () => {
    // arrange
    const tree = bracketOfEight()
    const first = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    const both = updateRepechageTree(tree, first, resultOf(fightIn(tree, 'semi2'), 5, 0)) as TournamentTreeNode
    // act - the second line is played
    const updated = updateRepechageTree(tree, both, resultOf(both.children[1].attributes.fight, 6, 2))
    // assert - both branches rebuild the children list from both lines, which is where one
    // of them gets dropped or overwritten
    expect(updated?.children).toHaveLength(2)
    expect(updated?.children[0].attributes.fight).toMatchObject({
      type: 'REPECHAGE_1', redName: 'X', blueName: 'B', winner: undefined,
    })
  })

  test('has no line to build where the semifinalist beat nobody on the way', () => {
    // arrange - four competitors, so a semifinal is the first fight there is
    const tree = node(mainFight('', '', 'final', 0), [
      node(mainFight('A', 'B', 'semi1', 1)),
      node(mainFight('C', 'D', 'semi2', 1)),
    ])
    // act
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    // assert - one opponent is not a line, and an empty repechage is no repechage
    expect(repechage).toBeNull()
  })
})

/**
 * Reopening a fight that nothing depends on costs nothing, and asking about it every time
 * teaches people to click through the question. Asking when there is something to lose is
 * the whole value of the dialog.
 */
describe('needsConfirmationToReopen', () => {
  /**
   * The final comes out false through the parent check as well - there is nothing above it,
   * so `findParentFightFor` finds nobody. The guard on top of the function says the rule
   * out loud rather than leaving it to fall out of the search, and no input tells them
   * apart; this test pins the outcome, not the guard.
   */
  test('lets the final be reopened without a word', () => {
    // arrange - there is nothing after it to go wrong
    const tree = bracketOfEight()
    // act + assert
    expect(needsConfirmationToReopen(fightIn(tree, 'final'), tree, null)).toBe(false)
  })

  /**
   * A semifinal asks because reopening it throws the repechage away and builds a new one.
   * Where there is no repechage - a bracket of four, where the semifinal winner beat nobody
   * on the way - there is nothing to throw away, and the question is one people learn to
   * click through.
   */
  test('asks about a semifinal whose repechage would be reset', () => {
    // arrange
    const tree = bracketOfEight()
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    // act + assert
    expect(needsConfirmationToReopen(fightIn(tree, 'semi1'), tree, repechage)).toBe(true)
  })

  test('says nothing about a semifinal with no repechage behind it', () => {
    // arrange - four competitors, and the final not played yet
    const tree = bracketOfFour()
    // act + assert
    expect(needsConfirmationToReopen(fightIn(tree, 'semi1'), tree, null)).toBe(false)
  })

  test('asks about a semifinal with no repechage once the final has been played', () => {
    // arrange - the result of the final is about to belong to somebody who may not reach it
    const tree = bracketOfFour()
    const played = updateTournamentTree(tree, resultOf(fightIn(tree, 'semi1'), 5, 0)) as TournamentTreeNode
    const decided = updateTournamentTree(played, resultOf(fightIn(played, 'semi2'), 5, 0)) as TournamentTreeNode
    const withFinal = updateTournamentTree(decided, resultOf(fightIn(decided, 'final'), 3, 1)) as TournamentTreeNode
    // act + assert
    expect(needsConfirmationToReopen(fightIn(withFinal, 'semi1'), withFinal, null)).toBe(true)
  })

  test('asks about a fight whose winner has already fought again', () => {
    // arrange - the semifinal above the quarterfinal is decided
    const tree = bracketOfEight()
    const decided = updateTournamentTree(tree, resultOf(fightIn(tree, 'semi1'), 5, 0)) as TournamentTreeNode
    // act + assert
    expect(needsConfirmationToReopen(fightIn(decided, 'q1'), decided, null)).toBe(true)
  })

  /**
   * A repechage fight is not in the main tree, so `findParentFightFor` finds nothing above
   * it and it never asks. That is right for the fight at the top of a line, and it also
   * means the dialog's repechage wording is never reached - noted in the ticket, left as
   * it is here.
   */
  test('says nothing about a repechage fight', () => {
    // arrange
    const tree = bracketOfEight()
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0)) as TournamentTreeNode
    // act + assert
    expect(needsConfirmationToReopen(repechage.children[0].attributes.fight, tree, repechage)).toBe(false)
  })

  test('says nothing about a fight whose winner has not fought again yet', () => {
    // arrange
    const tree = bracketOfEight()
    // act + assert
    expect(needsConfirmationToReopen(fightIn(tree, 'q1'), tree, null)).toBe(false)
  })
})

/**
 * The gate between `localStorage` and the bracket. Whatever comes back from `JSON.parse` is
 * handed straight to it, so it is the only thing standing between a half-written value from
 * an older version of the app and a screen that reads fields which are not there.
 */
describe('isValidFight', () => {
  const valid = (): Fight => fight('Aneta', 'Bob')

  test('takes a fight as the app writes it', () => {
    // act + assert
    expect(isValidFight(valid())).toBe(true)
  })

  test('takes one with a winner and a log', () => {
    // act + assert
    expect(isValidFight({
      ...valid(),
      winner: 'RED',
      log: [{ at: 1000, fightTime: 120, event: { kind: 'START' } }],
    })).toBe(true)
  })

  /**
   * `typeof null === 'object'`, so the first line of this validator lets null past and the
   * second one reaches into it. Five validators across the type files are built this way;
   * `isValidTournamentTree` is the one that is not, because a repechage tree legitimately
   * is null until a semifinal is decided, so it spells that case out. Nothing hits this
   * today - `getValidatedTypeFromLS` checks for null before it calls, and it calls inside
   * a try - so it is pinned rather than fixed: this ticket does not change production code.
   */
  test('throws on null instead of turning it down', () => {
    // act + assert
    expect(() => isValidFight(null)).toThrow(TypeError)
  })

  test.each(['RED', 'BLUE', 'NONE'])('takes senchu %s', (senchu) => {
    // act + assert - each of the three separately, or narrowing the check goes unnoticed
    expect(isValidFight({ ...valid(), senchu })).toBe(true)
  })

  // one case per property the validator looks at: checking only one side of a pair leaves
  // the other free to be deleted, and this is the gate a saved bracket comes through
  test.each([
    { name: 'a number where the object should be', value: 5 },
    { name: 'no uuid', value: { ...valid(), uuid: undefined } },
    { name: 'no depth', value: { ...valid(), depth: undefined } },
    { name: 'no type', value: { ...valid(), type: undefined } },
    { name: 'aka without an identity', value: { ...valid(), redUuid: undefined } },
    { name: 'ao without an identity', value: { ...valid(), blueUuid: undefined } },
    { name: "aka's name as a number", value: { ...valid(), redName: 42 } },
    { name: "ao's name as a number", value: { ...valid(), blueName: 42 } },
    { name: "aka's points as text", value: { ...valid(), redPoints: '3' } },
    { name: "ao's points as text", value: { ...valid(), bluePoints: '3' } },
    { name: "aka's fouls as text", value: { ...valid(), redFouls: '1' } },
    { name: "ao's fouls as text", value: { ...valid(), blueFouls: '1' } },
    { name: 'a senchu nobody gives', value: { ...valid(), senchu: 'MAYBE' } },
    { name: 'a winner that is not a string', value: { ...valid(), winner: 1 } },
    { name: 'a mirror pointed at a number', value: { ...valid(), oppositeFight: 7 } },
    { name: 'a log that is not a log', value: { ...valid(), log: 'START' } },
  ])('turns down $name', ({ value }) => {
    // act + assert
    expect(isValidFight(value)).toBe(false)
  })
})

/**
 * What the question before reopening a fight is actually about, and what the dialog says
 * out loud. Reopening a semifinal builds its repechage line again from the new result, so
 * whatever was played in the old one is gone - but only where there was a line at all.
 */
describe('resetsRepechage', () => {
  const eightWithRepechage = (): [TournamentTreeNode, TournamentTreeNode] => {
    const tree = bracketOfEight()
    const first = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    const both = updateRepechageTree(tree, first, resultOf(fightIn(tree, 'semi2'), 5, 0))
    return [tree, both as TournamentTreeNode]
  }

  test('is true for a semifinal with a line of its own', () => {
    // arrange
    const [tree, repechage] = eightWithRepechage()
    // act + assert
    expect(resetsRepechage(fightIn(tree, 'semi1'), tree, repechage)).toBe(true)
  })

  test('is true for the other semifinal as well', () => {
    // arrange
    const [tree, repechage] = eightWithRepechage()
    // act + assert
    expect(resetsRepechage(fightIn(tree, 'semi2'), tree, repechage)).toBe(true)
  })

  test('is false for a semifinal whose half of the repechage was never built', () => {
    // arrange - only the first semifinal has been decided
    const tree = bracketOfEight()
    const first = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    // act + assert
    expect(resetsRepechage(fightIn(tree, 'semi2'), tree, first)).toBe(false)
  })

  test('is false where there is no repechage at all', () => {
    // arrange
    const tree = bracketOfFour()
    // act + assert
    expect(resetsRepechage(fightIn(tree, 'semi1'), tree, null)).toBe(false)
  })

  test.each([
    { name: 'the final', uuid: 'final' },
    { name: 'a quarterfinal', uuid: 'q1' },
  ])('is false for $name, which builds no line', ({ uuid }) => {
    // arrange
    const [tree, repechage] = eightWithRepechage()
    // act + assert
    expect(resetsRepechage(fightIn(tree, uuid), tree, repechage)).toBe(false)
  })
})

/**
 * What pressing a fight in the bracket does. It lives away from the screen because the
 * screen holds a `react-d3-tree` that jsdom will not lay out, so a decision left inside
 * that component is a decision nothing can reach.
 */
describe('openFightAction', () => {
  const withRepechage = (): [TournamentTreeNode, TournamentTreeNode] => {
    const tree = bracketOfEight()
    const repechage = updateRepechageTree(tree, null, resultOf(fightIn(tree, 'semi1'), 5, 0))
    return [tree, repechage as TournamentTreeNode]
  }

  test('does nothing where half of the pairing is still to be decided', () => {
    // arrange - the final has nobody in it yet
    const tree = bracketOfEight()
    // act + assert
    expect(openFightAction(fightIn(tree, 'final'), tree, null)).toBe('NOTHING')
  })

  test('opens a fight that has not been played', () => {
    // arrange
    const tree = bracketOfEight()
    // act + assert
    expect(openFightAction(fightIn(tree, 'q1'), tree, null)).toBe('OPEN')
  })

  test('opens a played fight that nothing depends on', () => {
    // arrange - the semifinal above it is still open
    const tree = bracketOfEight()
    const played = updateTournamentTree(tree, resultOf(fightIn(tree, 'q1'), 5, 0)) as TournamentTreeNode
    // act + assert
    expect(openFightAction(fightIn(played, 'q1'), played, null)).toBe('OPEN')
  })

  test('asks before reopening a semifinal whose repechage would go', () => {
    // arrange
    const [tree, repechage] = withRepechage()
    const played = updateTournamentTree(tree, resultOf(fightIn(tree, 'semi1'), 5, 0)) as TournamentTreeNode
    // act + assert
    expect(openFightAction(fightIn(played, 'semi1'), played, repechage)).toBe('ASK')
  })

  test('hands the repechage on rather than deciding without it', () => {
    // arrange - the same semifinal, with the line that would be lost left out
    const [tree, repechage] = withRepechage()
    const played = updateTournamentTree(tree, resultOf(fightIn(tree, 'semi1'), 5, 0)) as TournamentTreeNode
    // act
    const withLine = openFightAction(fightIn(played, 'semi1'), played, repechage)
    const withoutLine = openFightAction(fightIn(played, 'semi1'), played, null)
    // assert - the answer has to depend on it, or the screen could stop passing it and
    // no test would notice
    expect(withLine).toBe('ASK')
    expect(withoutLine).toBe('OPEN')
  })
})
