import { vi } from 'vitest'
import { Competitor, createTournamentTree, Fight, FightResult, switchResultSides } from '../tournament'
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
