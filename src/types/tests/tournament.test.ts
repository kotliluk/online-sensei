import { Competitor, createTournamentTree, Fight } from '../tournament'


jest.mock('uuid', () => ({ v4: () => 'mocked-uuid-v4' }))

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
