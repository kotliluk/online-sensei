import {
  decodeReactionsSetUp,
  defaultReactionsSetUp,
  encodeReactionsSetUp,
  hasReactionsSetUp,
} from '../reactionsUrl'
import {
  decodeIntervalTimerAdvancedSetUp,
  decodeIntervalTimerSimpleSetUp,
  defaultIntervalTimerAdvancedSetUp,
  defaultIntervalTimerSimpleSetUp,
  encodeIntervalTimerAdvancedSetUp,
  encodeIntervalTimerSimpleSetUp,
} from '../intervalTimerUrl'
import {
  decodeGroupStopwatchSetUp,
  defaultGroupStopwatchSetUp,
  encodeGroupStopwatchSetUp,
} from '../groupStopwatchUrl'
import { joinList, splitList } from '../params'
import { newCompetitorSetup } from '../../../types/groupStopwatch'


const roundTrip = <T>(encode: (v: T) => URLSearchParams, decode: (p: URLSearchParams) => T, value: T): T => {
  // through a real query string, so that URLSearchParams escaping is exercised
  return decode(new URLSearchParams(encode(value).toString()))
}

describe('list escaping', () => {
  test.each([
    [['a', 'b']],
    [['with, comma', 'plain']],
    [['back\\slash', 'a']],
    [['comma, and \\ slash', '']],
    [['']],
  ])('round trips %s', (items) => {
    expect(splitList(joinList(items))).toEqual(items)
  })
})

describe('reactions set up in a URL', () => {
  test('defaults produce an empty query', () => {
    const params = encodeReactionsSetUp(defaultReactionsSetUp())

    expect(params.toString()).toBe('')
    expect(hasReactionsSetUp(params)).toBe(false)
  })

  test('a customised set up round trips', () => {
    const setUp = {
      ...defaultReactionsSetUp(),
      rounds: 25,
      signalDuration: 350,
      minInterval: 1500,
      maxInterval: 3000,
      signalCount: 3,
      signalColors: ['#111111', '#222222', '#333333', '#444444'],
      audioVolume: 0.4,
    }

    expect(roundTrip(encodeReactionsSetUp, decodeReactionsSetUp, setUp)).toEqual(setUp)
  })

  test('an omitted field falls back to the default, not to the reader own value', () => {
    const params = new URLSearchParams('rounds=25')
    const someoneElsesSetUp = { ...defaultReactionsSetUp(), audioVolume: 0.1 }

    // decoding a shared link must not mix in the recipient's stored volume
    expect(decodeReactionsSetUp(params).audioVolume).toBe(defaultReactionsSetUp().audioVolume)
    expect(someoneElsesSetUp.audioVolume).toBe(0.1)
  })

  test.each([
    ['rounds=-5', 'rounds'],
    ['rounds=abc', 'rounds'],
    ['rounds=999999999', 'rounds'],
    ['count=99', 'signalCount'],
    ['vol=7', 'audioVolume'],
    ['sound=DROP+TABLE', 'audioSound'],
    ['signal=0', 'signalDuration'],
  ] as const)('rejects %s and keeps the default', (query, field) => {
    const decoded = decodeReactionsSetUp(new URLSearchParams(query))

    expect(decoded[field]).toEqual(defaultReactionsSetUp()[field])
  })

  test('rejects malformed colours', () => {
    const decoded = decodeReactionsSetUp(new URLSearchParams('colors=lol-nope-nah-zzz'))

    expect(decoded.signalColors).toEqual(defaultReactionsSetUp().signalColors)
  })

  test('pads a short colour list from the defaults', () => {
    const decoded = decodeReactionsSetUp(new URLSearchParams('colors=111111-222222'))

    expect(decoded.signalColors).toEqual([
      '#111111',
      '#222222',
      defaultReactionsSetUp().signalColors[2],
      defaultReactionsSetUp().signalColors[3],
    ])
  })

  test('a reversed interval range is discarded rather than shown as an error', () => {
    const decoded = decodeReactionsSetUp(new URLSearchParams('min=5000&max=1000'))

    expect(decoded.minInterval).toBe(defaultReactionsSetUp().minInterval)
    expect(decoded.maxInterval).toBe(defaultReactionsSetUp().maxInterval)
  })
})

describe('interval timer set up in a URL', () => {
  test('simple round trips', () => {
    const setUp = {
      ...defaultIntervalTimerSimpleSetUp(),
      simpleRounds: 8,
      simpleWork: 45,
      simplePause: 15,
      skipLastPause: false,
      audioVolume: 0.6,
    }

    expect(roundTrip(encodeIntervalTimerSimpleSetUp, decodeIntervalTimerSimpleSetUp, setUp)).toEqual(setUp)
  })

  test('advanced round trips, including names that need escaping', () => {
    const setUp = {
      ...defaultIntervalTimerAdvancedSetUp(),
      advancedRounds: 3,
      advancedRoundIntervals: [
        { type: 'work' as const, name: 'Sprint, hard', duration: 20 },
        { type: 'pause' as const, name: 'Rest; breathe', duration: 40 },
        { type: 'work' as const, name: 'back\\slash', duration: 15 },
        { type: 'work' as const, name: '', duration: 5 },
      ],
    }

    expect(roundTrip(encodeIntervalTimerAdvancedSetUp, decodeIntervalTimerAdvancedSetUp, setUp)).toEqual(setUp)
  })

  test('a broken interval discards the whole list', () => {
    const decoded = decodeIntervalTimerAdvancedSetUp(new URLSearchParams('iv=w;Fine;10,x;Bogus;10'))

    expect(decoded.advancedRoundIntervals).toEqual(defaultIntervalTimerAdvancedSetUp().advancedRoundIntervals)
  })

  test('an out-of-range duration discards the whole list', () => {
    const decoded = decodeIntervalTimerAdvancedSetUp(new URLSearchParams('iv=w;Fine;10,w;TooLong;99999'))

    expect(decoded.advancedRoundIntervals).toEqual(defaultIntervalTimerAdvancedSetUp().advancedRoundIntervals)
  })

  test('an empty interval list is rejected', () => {
    const decoded = decodeIntervalTimerAdvancedSetUp(new URLSearchParams('iv='))

    expect(decoded.advancedRoundIntervals).toEqual(defaultIntervalTimerAdvancedSetUp().advancedRoundIntervals)
  })
})

describe('group stopwatch set up in a URL', () => {
  test('names round trip', () => {
    const params = encodeGroupStopwatchSetUp({
      competitorsCount: 3,
      competitors: [
        { name: 'Alice', color: '#f99c3c' },
        { name: 'Bob', color: '#f99c3c' },
        { name: 'Charles', color: '#f99c3c' },
      ],
    })
    const decoded = decodeGroupStopwatchSetUp(new URLSearchParams(params.toString()))

    expect(decoded.competitorsCount).toBe(3)
    expect(decoded.competitors.slice(0, 3).map((c) => c.name)).toEqual(['Alice', 'Bob', 'Charles'])
  })

  test('uniform default colours are left out of the link', () => {
    const params = encodeGroupStopwatchSetUp({
      competitorsCount: 2,
      competitors: [
        { name: 'Alice', color: '#f99c3c' },
        { name: 'Bob', color: '#f99c3c' },
      ],
    })

    expect(params.has('colors')).toBe(false)
  })

  test('custom colours round trip', () => {
    const competitors = [
      { name: 'Alice', color: '#ff0000' },
      { name: 'Bob', color: '#0000ff' },
    ]
    const params = encodeGroupStopwatchSetUp({ competitorsCount: 2, competitors })
    const decoded = decodeGroupStopwatchSetUp(new URLSearchParams(params.toString()))

    expect(decoded.competitors.slice(0, 2)).toEqual(competitors)
  })

  test('only the competitors in use are shared', () => {
    const params = encodeGroupStopwatchSetUp({
      competitorsCount: 2,
      competitors: [
        { name: 'Alice', color: '#f99c3c' },
        { name: 'Bob', color: '#f99c3c' },
        { name: 'LeftOver', color: '#f99c3c' },
      ],
    })

    expect(params.get('names')).not.toContain('LeftOver')
  })

  test('the competitor list is grown to the shared count', () => {
    const decoded = decodeGroupStopwatchSetUp(new URLSearchParams('count=5&names=Alice,Bob'))

    expect(decoded.competitorsCount).toBe(5)
    expect(decoded.competitors).toHaveLength(5)
    expect(decoded.competitors[4]).toEqual({ name: '', color: '#f99c3c' })
  })

  test('an out-of-range count keeps the default', () => {
    const decoded = decodeGroupStopwatchSetUp(new URLSearchParams('count=1000'))

    expect(decoded.competitorsCount).toBe(defaultGroupStopwatchSetUp().competitorsCount)
  })

  test('a malformed colour costs that colour and nothing else', () => {
    const decoded = decodeGroupStopwatchSetUp(new URLSearchParams('count=2&names=A,B&colors=zzzzzz-000000'))

    expect(decoded.competitors[0]).toEqual({ name: 'A', color: newCompetitorSetup().color })
    expect(decoded.competitors[1]).toEqual({ name: 'B', color: '#000000' })
  })
})

const DEFAULT_COLOR = newCompetitorSetup().color

describe('decodeGroupStopwatchSetUp - a link that arrived damaged', () => {
  test('keeps the names when one colour is unreadable', () => {
    // arrange - a link cut short by a chat window, which is how they usually arrive
    const params = new URLSearchParams('count=3&names=Alice,Bob,Cyril&colors=ff0000-00ff00-00ff0')
    // act
    const decoded = decodeGroupStopwatchSetUp(params)
    // assert
    expect(decoded.competitors.slice(0, 3).map((c) => c.name)).toEqual(['Alice', 'Bob', 'Cyril'])
  })

  test('replaces only the colour it could not read', () => {
    // arrange
    const params = new URLSearchParams('count=3&names=Alice,Bob,Cyril&colors=ff0000-00ff00-00ff0')
    // act
    const decoded = decodeGroupStopwatchSetUp(params)
    // assert
    expect(decoded.competitors[0].color).toBe('#ff0000')
    expect(decoded.competitors[1].color).toBe('#00ff00')
    expect(decoded.competitors[2].color).toBe(DEFAULT_COLOR)
  })

  test('an intact link still round-trips', () => {
    // arrange
    const params = new URLSearchParams('count=3&names=Alice,Bob,Cyril&colors=ff0000-00ff00-0000ff')
    // act
    const decoded = decodeGroupStopwatchSetUp(params)
    // assert
    expect(decoded.competitors.slice(0, 3).map((c) => c.color)).toEqual(['#ff0000', '#00ff00', '#0000ff'])
  })

  test('missing colours fall back without touching the names', () => {
    // arrange - fewer colours than names
    const params = new URLSearchParams('count=3&names=Alice,Bob,Cyril&colors=ff0000')
    // act
    const decoded = decodeGroupStopwatchSetUp(params)
    // assert
    expect(decoded.competitors[2].name).toBe('Cyril')
    expect(decoded.competitors[2].color).toBe(DEFAULT_COLOR)
  })
})
