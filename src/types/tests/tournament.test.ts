import { createTournamentTree } from '../tournament'


jest.mock('uuid', () => ({ v4: () => 'mocked-uuid-v4' }))

const competitor = (name: string) => ({
  uuid: name,
  name,
  result: -1,
})

const fight = (red: string, blue: string) => ({
  uuid: 'mocked-uuid-v4',
  depth: 0,
  winner: undefined,
  redUuid: red,
  redName: red,
  redPoints: 0,
  redSenchu: false,
  redFouls: 0,
  blueUuid: blue,
  blueName: blue,
  bluePoints: 0,
  blueSenchu: false,
  blueFouls: 0,
  winnerGoesTo: undefined,
})

describe('createTree', () => {
  test.each([
    {
      competitors: [competitor('1')],
      expected: {
        fight: fight('1', ''), left: undefined, right: undefined,
      },
    },
    {
      competitors: [competitor('1'), competitor('2')],
      expected: {
        fight: fight('1', '2'), left: undefined, right: undefined,
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3')],
      expected: {
        fight: fight('', '3'),
        left: {
          fight: fight('1', '2'), left: undefined, right: undefined,
        },
        right: undefined,
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4')],
      expected: {
        fight: fight('', ''),
        left: {
          fight: fight('1', '2'), left: undefined, right: undefined,
        },
        right: {
          fight: fight('3', '4'), left: undefined, right: undefined,
        },
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4'), competitor('5')],
      expected: {
        fight: fight('', ''),
        left: {
          fight: fight('', '3'),
          left: {
            fight: fight('1', '2'), left: undefined, right: undefined,
          },
          right: undefined,
        },
        right: {
          fight: fight('4', '5'), left: undefined, right: undefined,
        },
      },
    },
  ])('%s', ({ competitors, expected }) => {
    // act
    const actual = createTournamentTree(competitors, 0)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})
