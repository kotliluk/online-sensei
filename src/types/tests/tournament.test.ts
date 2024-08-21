import { createTournamentTree } from '../tournament'


jest.mock('uuid', () => ({ v4: () => 'mocked-uuid-v4' }))

const competitor = (name: string) => ({
  uuid: name,
  name,
})

const fight = (red: string, blue: string, winnerGoesTo: string | undefined = undefined) => ({
  uuid: 'mocked-uuid-v4',
  depth: 0,
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
  winnerGoesTo: winnerGoesTo,
  oppositeFight: undefined,
})

describe('createTournamentTree', () => {
  test.each([
    {
      competitors: [competitor('1')],
      expected: {
        fight: fight('1', ''), left: null, right: null,
      },
    },
    {
      competitors: [competitor('1'), competitor('2')],
      expected: {
        fight: fight('1', '2'), left: null, right: null,
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3')],
      expected: {
        fight: fight('', '3'),
        left: {
          fight: fight('1', '2', 'mocked-uuid-v4'), left: null, right: null,
        },
        right: null,
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4')],
      expected: {
        fight: fight('', ''),
        left: {
          fight: fight('1', '2', 'mocked-uuid-v4'), left: null, right: null,
        },
        right: {
          fight: fight('3', '4', 'mocked-uuid-v4'), left: null, right: null,
        },
      },
    },
    {
      competitors: [competitor('1'), competitor('2'), competitor('3'), competitor('4'), competitor('5')],
      expected: {
        fight: fight('', ''),
        left: {
          fight: fight('', '3', 'mocked-uuid-v4'),
          left: {
            fight: fight('1', '2', 'mocked-uuid-v4'), left: null, right: null,
          },
          right: null,
        },
        right: {
          fight: fight('4', '5', 'mocked-uuid-v4'), left: null, right: null,
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
