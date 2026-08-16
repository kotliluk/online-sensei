import { playedFights, tournamentFights, TournamentSource } from '../collect'
import {
  Competitor, createGroup, createTournamentTree, Fight, FightResult, newFight, TournamentTreeNode, updateGroupTable,
} from '../../../types/tournament'
import { FightLogEntry } from '../../../types/fightLog'


const competitors = (...names: string[]): Competitor[] => names.map((name) => ({ uuid: name, name }))

const log = (at: number): FightLogEntry[] => [
  { at, fightTime: 120, event: { kind: 'START' } },
  { at: at + 1000, fightTime: 118, event: { kind: 'POINTS', side: 'RED', delta: 3 } },
]

/** Plays a fight the way the app does - through the result, so the mirrored cell is filled in too. */
const play = (group: Fight[][], row: number, column: number, at: number): Fight[][] => {
  const fight = group[row][column]
  const result: FightResult = {
    uuid: fight.uuid,
    type: fight.type,
    winner: 'RED',
    redPoints: 3,
    redFouls: 0,
    bluePoints: 1,
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

const treeSource = (tree: TournamentTreeNode | null, repechage: TournamentTreeNode | null): TournamentSource => ({
  name: 'Camp',
  type: 'TREE',
  group: [],
  tree,
  repechage,
})

const namesOf = (fights: { redName?: string, blueName?: string }[]): string[] => {
  return fights.map((fight) => `${fight.redName}-${fight.blueName}`)
}

describe('tournamentFights of a group', () => {
  const roster = competitors('Aneta', 'Bob', 'Cyril')

  test('lists every pairing once, leaving out the mirror and the diagonal', () => {
    // arrange - the table holds 9 cells for 3 competitors
    const group = createGroup(roster)
    // act
    const fights = tournamentFights(groupSource(group))
    // assert - three pairings, each with the fighter of its own row in the red corner
    expect(namesOf(fights)).toEqual(['Aneta-Bob', 'Aneta-Cyril', 'Bob-Cyril'])
  })
})

describe('tournamentFights of a tree', () => {
  test('lists the fights of the bracket, first round first', () => {
    // arrange - 4 competitors: two semifinals and a final
    const tree = createTournamentTree(competitors('Aneta', 'Bob', 'Cyril', 'Dana'), 0)
    // act
    const fights = tournamentFights(treeSource(tree, null))
    // assert
    expect(namesOf(fights)).toEqual(['Aneta-Bob', 'Cyril-Dana', '-'])
  })

  test('adds the repechage without its artificial root', () => {
    // arrange - the shape the app builds: a root holding the repechage lines
    const line = {
      name: '',
      attributes: { fight: newFight('Bob', 'Bob', 'Dana', 'Dana', 'REPECHAGE_1') },
      children: [],
    }
    const repechage = {
      name: '',
      attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
      children: [line],
    }
    const tree = createTournamentTree(competitors('Aneta', 'Bob', 'Cyril', 'Dana'), 0)
    // act
    const fights = tournamentFights(treeSource(tree, repechage))
    // assert - the root is a layout device, not a fight anybody steps into
    expect(namesOf(fights)).toContain('Bob-Dana')
    expect(fights.map((fight) => fight.type)).not.toContain('REPECHAGE_ROOT')
  })
})

describe('playedFights', () => {
  const roster = competitors('Aneta', 'Bob', 'Cyril')

  test('leaves out what has not been fought yet', () => {
    // arrange
    const group = play(createGroup(roster), 0, 1, 1000)
    // act
    const fights = playedFights(groupSource(group))
    // assert
    expect(namesOf(fights)).toEqual(['Aneta-Bob'])
  })

  test('never lists a fight twice, however the table mirrors it', () => {
    // arrange - both halves of the table now hold this fight
    const group = play(createGroup(roster), 0, 1, 1000)
    // act
    const fights = playedFights(groupSource(group))
    // assert - and the surviving one is the half that was actually played
    expect(fights).toHaveLength(1)
    expect(fights[0].log.map((entry) => entry.event)).toEqual([
      { kind: 'START' },
      { kind: 'POINTS', side: 'RED', delta: 3 },
    ])
  })

  test('orders the fights by when they started, not by where they sit in the table', () => {
    // arrange - the last cell of the table was fought first
    let group = createGroup(roster)
    group = play(group, 1, 2, 1000)
    group = play(group, 0, 1, 5000)
    // act
    const fights = playedFights(groupSource(group))
    // assert
    expect(namesOf(fights)).toEqual(['Bob-Cyril', 'Aneta-Bob'])
  })

  test('keeps a fight that has a winner but nothing logged, at the end', () => {
    // arrange - saved without the clock ever running
    let group = play(createGroup(roster), 1, 2, 5000)
    group = group.map((row) => row.map((fight) => (
      fight.redName === 'Aneta' && fight.blueName === 'Bob'
        ? { ...fight, winner: 'RED' as const, log: [] }
        : fight
    )))
    // act
    const fights = playedFights(groupSource(group))
    // assert
    expect(namesOf(fights)).toEqual(['Bob-Cyril', 'Aneta-Bob'])
  })

  /**
   * Two of them, not one. With a single such fight the comparator never subtracts
   * one sentinel from another, so a sentinel of `Infinity` - whose difference with
   * itself is `NaN` - would pass unnoticed and leave the whole array in whatever
   * order it happened to be in.
   */
  test('still orders the logged fights when more than one has nothing to go by', () => {
    // arrange - two fights saved without the clock ever running, two fought
    let group = createGroup(competitors('Aneta', 'Bob', 'Cyril', 'Dana'))
    group = play(group, 2, 3, 9000)
    group = play(group, 0, 1, 4000)
    group = group.map((row) => row.map((fight) => (
      (fight.redName === 'Aneta' && fight.blueName === 'Cyril')
      || (fight.redName === 'Bob' && fight.blueName === 'Dana')
        ? { ...fight, winner: 'RED' as const, log: [] }
        : fight
    )))
    // act
    const fights = playedFights(groupSource(group))
    // assert - the fought ones lead, oldest first; the two without a log follow
    expect(namesOf(fights).slice(0, 2)).toEqual(['Aneta-Bob', 'Cyril-Dana'])
    expect(namesOf(fights).slice(2).sort()).toEqual(['Aneta-Cyril', 'Bob-Dana'])
  })

  test('carries the tournament name onto every fight, so the rows stand on their own', () => {
    // arrange
    const group = play(createGroup(roster), 0, 1, 1000)
    // act
    const fights = playedFights(groupSource(group))
    // assert
    expect(fights[0].tournamentName).toBe('Camp')
  })

  test('has nothing to say about a tournament nobody has fought in', () => {
    // act & assert
    expect(playedFights(groupSource(createGroup(roster)))).toEqual([])
    expect(playedFights(treeSource(null, null))).toEqual([])
  })
})
