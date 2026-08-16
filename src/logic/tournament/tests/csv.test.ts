import {
  buildTournamentLogCsv, buildTournamentOverviewCsv, tournamentCsvFileName,
} from '../csv'
import { TournamentSource } from '../collect'
import { fightCsvHeader } from '../../fightLog/csv'
import { EN } from '../../translation/en'
import { CS } from '../../translation/cs'
import {
  Competitor, createGroup, createTournamentTree, Fight, FightResult, newFight, TournamentTreeNode, updateGroupTable,
} from '../../../types/tournament'
import { FightLogEntry } from '../../../types/fightLog'


const competitors = (...names: string[]): Competitor[] => names.map((name) => ({ uuid: name, name }))

const roster = competitors('Aneta', 'Bob', 'Cyril')

const log = (at: number): FightLogEntry[] => [
  { at, fightTime: 120, event: { kind: 'START' } },
  { at: at + 1000, fightTime: 118, event: { kind: 'POINTS', side: 'RED', delta: 3 } },
]

const play = (group: Fight[][], row: number, column: number, at: number, red = 3, blue = 1): Fight[][] => {
  const fight = group[row][column]
  const result: FightResult = {
    uuid: fight.uuid,
    type: fight.type,
    winner: red > blue ? 'RED' : (blue > red ? 'BLUE' : 'DRAW'),
    redPoints: red,
    redFouls: 0,
    bluePoints: blue,
    blueFouls: 0,
    senchu: 'NONE',
    oppositeFight: fight.oppositeFight,
    log: log(at),
  }

  return updateGroupTable(group, result)
}

const groupSource = (group: Fight[][]): TournamentSource => ({
  name: 'Camp',
  type: 'GROUP',
  group,
  tree: null,
  repechage: null,
})

const treeSource = (
  tree: TournamentTreeNode | null,
  repechage: TournamentTreeNode | null = null,
): TournamentSource => ({
  name: 'Camp',
  type: 'TREE',
  group: [],
  tree,
  repechage,
})

/** Splits the built file back apart. Only safe while no cell needs quoting. */
const rowsOf = (csv: string): string[][] => csv.trimEnd().split('\r\n').map((row) => row.split(';'))

describe('buildTournamentLogCsv', () => {
  test('writes one header and then every fight behind it', () => {
    // arrange
    let group = createGroup(roster)
    group = play(group, 0, 1, 1000)
    group = play(group, 1, 2, 5000)
    // act
    const rows = rowsOf(buildTournamentLogCsv(groupSource(group), EN))
    // assert - the header, then two rows of the first fight and two of the second
    expect(rows[0]).toEqual(fightCsvHeader(EN))
    expect(rows).toHaveLength(5)
    expect(rows.slice(1).map((row) => [row[1], row[2], row[5]])).toEqual([
      ['Aneta', 'Bob', 'START'],
      ['Aneta', 'Bob', 'POINTS'],
      ['Bob', 'Cyril', 'START'],
      ['Bob', 'Cyril', 'POINTS'],
    ])
  })

  test('opens the same way as the export of a single fight, column for column', () => {
    // arrange
    const group = play(createGroup(roster), 0, 1, 1000)
    // act
    const rows = rowsOf(buildTournamentLogCsv(groupSource(group), CS))
    // assert - the whole point of the flat shape is that these two files are one format
    expect(rows[0]).toEqual(fightCsvHeader(CS))
    expect(rows[1]).toHaveLength(rows[0].length)
  })

  test('names the tournament on every row', () => {
    // arrange
    const group = play(createGroup(roster), 0, 1, 1000)
    // act
    const rows = rowsOf(buildTournamentLogCsv(groupSource(group), EN)).slice(1)
    // assert
    rows.forEach((row) => expect(row[0]).toBe('Camp'))
  })

  test('is a header on its own when nothing has been fought', () => {
    // act
    const rows = rowsOf(buildTournamentLogCsv(groupSource(createGroup(roster)), EN))
    // assert
    expect(rows).toEqual([fightCsvHeader(EN)])
  })
})

describe('buildTournamentOverviewCsv of a group', () => {
  const played = (): Fight[][] => {
    let group = createGroup(roster)
    group = play(group, 0, 1, 1000, 3, 1)
    group = play(group, 0, 2, 2000, 2, 2)
    return group
  }

  test('writes the table the screen shows: names across the top and down the side', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(groupSource(played()), EN))
    // assert
    expect(rows[0]).toEqual(['', 'Aneta', 'Bob', 'Cyril', 'W', 'D', 'L', '+', '-', '+/-'])
    expect(rows.slice(1).map((row) => row[0])).toEqual(['Aneta', 'Bob', 'Cyril'])
  })

  test('writes a played fight as its score and leaves the rest of the table empty', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(groupSource(played()), EN))
    // assert - the diagonal is a fighter against themselves, and the last pairing was never fought
    expect(rows[1].slice(1, 4)).toEqual(['', '3:1', '2:2'])
    expect(rows[2].slice(1, 4)).toEqual(['1:3', '', ''])
    expect(rows[3].slice(1, 4)).toEqual(['2:2', '', ''])
  })

  test('ends each row with the same tally the screen puts there', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(groupSource(played()), EN))
    // assert - Aneta won one and drew one, Bob lost one
    expect(rows[1].slice(4)).toEqual(['1', '1', '0', '5', '3', '2'])
    expect(rows[2].slice(4)).toEqual(['0', '0', '1', '1', '3', '-2'])
    expect(rows[3].slice(4)).toEqual(['0', '1', '0', '2', '2', '0'])
  })

  test('is still a readable draw sheet before anything has been fought', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(groupSource(createGroup(roster)), EN))
    // assert
    expect(rows).toHaveLength(4)
    expect(rows[1].slice(1, 4)).toEqual(['', '', ''])
  })
})

describe('buildTournamentOverviewCsv of a tree', () => {
  const eight = competitors('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H')

  test('names the round of every fight, counting the plain ones from the start', () => {
    // arrange - 8 competitors: four first round fights, two semifinals, a final
    const tree = createTournamentTree(eight, 0)
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(treeSource(tree), EN))
    // assert
    expect(rows[0]).toEqual(['Round', 'AKA', 'AO', 'AKA points', 'AO points', 'Winner'])
    expect(rows.slice(1).map((row) => row[0])).toEqual([
      'Round 1', 'Round 1', 'Round 1', 'Round 1', 'Semifinal', 'Semifinal', 'Final',
    ])
  })

  test('marks the repechage as its own line rather than a round', () => {
    // arrange - the shape the app builds around the lines
    const repechage: TournamentTreeNode = {
      name: '',
      attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
      children: [
        { name: '', attributes: { fight: newFight('B', 'B', 'D', 'D', 'REPECHAGE_1') }, children: [] },
        { name: '', attributes: { fight: newFight('F', 'F', 'H', 'H', 'REPECHAGE_2') }, children: [] },
      ],
    }
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(treeSource(createTournamentTree(eight, 0), repechage), EN))
    // assert
    expect(rows.slice(-2).map((row) => [row[0], row[1], row[2]])).toEqual([
      ['Repechage 1', 'B', 'D'],
      ['Repechage 2', 'F', 'H'],
    ])
  })

  test('writes the winner by name, because a person reads this file', () => {
    // arrange
    const tree = createTournamentTree(competitors('A', 'B'), 0)
    const result: FightResult = {
      uuid: tree.attributes.fight.uuid,
      type: 'MAIN',
      winner: 'BLUE',
      redPoints: 1,
      redFouls: 0,
      bluePoints: 4,
      blueFouls: 0,
      senchu: 'NONE',
      oppositeFight: undefined,
      log: log(1000),
    }
    const played = { ...tree, attributes: { fight: { ...tree.attributes.fight, ...result } } }
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(treeSource(played), EN))
    // assert
    expect(rows[1]).toEqual(['Final', 'A', 'B', '1', '4', 'B'])
  })

  test('leaves a fight that has not happened with empty results', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(treeSource(createTournamentTree(competitors('A', 'B'), 0)), EN))
    // assert
    expect(rows[1]).toEqual(['Final', 'A', 'B', '', '', ''])
  })

  test('has nothing but a header for a tournament with no bracket at all', () => {
    // act
    const rows = rowsOf(buildTournamentOverviewCsv(treeSource(null), EN))
    // assert
    expect(rows).toHaveLength(1)
  })
})

describe('tournamentCsvFileName', () => {
  test.each([
    { name: 'Camp', part: 'log' as const, expected: 'kumite-camp-log-2026-08-15-0905.csv' },
    { name: 'Camp', part: 'overview' as const, expected: 'kumite-camp-overview-2026-08-15-0905.csv' },
    { name: 'Kadeti Č', part: 'log' as const, expected: 'kumite-kadeti-c-log-2026-08-15-0905.csv' },
    { name: '', part: 'log' as const, expected: 'kumite-log-2026-08-15-0905.csv' },
    { name: '🥋', part: 'log' as const, expected: 'kumite-log-2026-08-15-0905.csv' },
  ])('names the $part file of "$name"', ({ name, part, expected }) => {
    // act & assert
    expect(tournamentCsvFileName(part, name, new Date(2026, 7, 15, 9, 5))).toBe(expected)
  })
})
