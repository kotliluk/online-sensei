import {
  appendFightEvent,
  FightEvent,
  FightLogEntry,
  isValidFightLog,
  switchFightLogSides,
} from '../fightLog'


/** Builds a log by replaying events, the way the screen does. */
const logOf = (...events: [number, FightEvent][]): FightLogEntry[] => {
  return events.reduce<FightLogEntry[]>((log, [fightTime, event], i) => {
    return appendFightEvent(log, { at: 1000 + i, fightTime, event })
  }, [])
}

const points = (side: 'RED' | 'BLUE', delta: number): FightEvent => ({ kind: 'POINTS', side, delta })

const eventsOf = (log: FightLogEntry[]): FightEvent[] => log.map((entry) => entry.event)


describe('appendFightEvent', () => {
  test('appends the first event as it is', () => {
    // act
    const actual = appendFightEvent([], { at: 1, fightTime: 120, event: points('RED', 1) })
    // assert
    expect(actual).toEqual([{ at: 1, fightTime: 120, event: points('RED', 1) }])
  })

  test('adds up points of one fighter at the same clock reading', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, points('RED', 1)], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 3)])
  })

  test('groups points of one fighter even with the other fighter in between', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, points('BLUE', 1)], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 2), points('BLUE', 1)])
  })

  test('keeps points at different clock readings apart', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [119, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 1), points('RED', 1)])
  })

  test('drops the entry when the points given are taken back', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, points('RED', -1)])
    // assert
    expect(actual).toEqual([])
  })

  test('keeps the moment the entry was opened at when grouping into it', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, points('RED', 1)])
    // assert
    expect(actual).toEqual([{ at: 1000, fightTime: 120, event: points('RED', 2) }])
  })

  test.each<{ name: string, event: FightEvent }>([
    { name: 'the score being set to the zero it already is', event: points('RED', 0) },
    { name: 'fouls set to the value they already have', event: { kind: 'FOULS', side: 'RED', from: 2, to: 2 } },
    { name: 'senchu set to where it already is', event: { kind: 'SENCHU', from: 'RED', to: 'RED' } },
    { name: 'the clock reset to where it already stands', event: { kind: 'TIME_SET', from: 120, to: 120 } },
  ])('writes no entry for $name', ({ event }) => {
    // arrange
    const log = logOf([120, points('BLUE', 1)])
    // act
    const actual = appendFightEvent(log, { at: 9, fightTime: 120, event })
    // assert - and the very same log back, so nothing re-renders either
    expect(actual).toBe(log)
  })

  test('does not group across the fight being started', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, { kind: 'START' }], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 1), { kind: 'START' }, points('RED', 1)])
  })

  test('does not group across a manual change of the clock', () => {
    // arrange - the reading is the same on both sides of the change
    const change = { kind: 'TIME_SET', from: 130, to: 120 } as const
    // act
    const actual = logOf([120, points('RED', 1)], [120, change], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 1), change, points('RED', 1)])
  })

  test('does not group across a reset, even at the same clock reading', () => {
    // act
    const actual = logOf([120, points('RED', 1)], [120, { kind: 'RESET' }], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 1), { kind: 'RESET' }, points('RED', 1)])
  })

  test('does not group across a reopened fight', () => {
    // arrange
    const reopen: FightEvent = { kind: 'REOPEN', redPoints: 1, bluePoints: 0 }
    // act
    const actual = logOf([120, points('RED', 1)], [120, reopen], [120, points('RED', 1)])
    // assert
    expect(eventsOf(actual)).toEqual([points('RED', 1), reopen, points('RED', 1)])
  })

  test('never groups the clock being started, paused or resumed', () => {
    // act
    const actual = logOf(
      [120, { kind: 'START' }], [120, { kind: 'PAUSE' }], [120, { kind: 'RESUME' }], [120, { kind: 'PAUSE' }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([
      { kind: 'START' }, { kind: 'PAUSE' }, { kind: 'RESUME' }, { kind: 'PAUSE' },
    ])
  })

  test('groups a run of clock nudges into one change', () => {
    // act
    const actual = logOf(
      [120, { kind: 'TIME_SET', from: 120, to: 119 }],
      [119, { kind: 'TIME_SET', from: 119, to: 118 }],
      [118, { kind: 'TIME_SET', from: 118, to: 117 }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'TIME_SET', from: 120, to: 117 }])
  })

  test('drops the clock change when it is nudged back to where it started', () => {
    // act
    const actual = logOf(
      [120, { kind: 'TIME_SET', from: 120, to: 119 }],
      [119, { kind: 'TIME_SET', from: 119, to: 120 }],
    )
    // assert
    expect(actual).toEqual([])
  })

  test('stops grouping clock nudges once something else happens', () => {
    // act
    const actual = logOf(
      [120, { kind: 'TIME_SET', from: 121, to: 120 }],
      [120, points('RED', 1)],
      [120, { kind: 'TIME_SET', from: 120, to: 119 }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([
      { kind: 'TIME_SET', from: 121, to: 120 },
      points('RED', 1),
      { kind: 'TIME_SET', from: 120, to: 119 },
    ])
  })

  test('keeps the value the fouls ended on', () => {
    // act
    const actual = logOf(
      [120, { kind: 'FOULS', side: 'RED', from: 0, to: 1 }],
      [120, { kind: 'FOULS', side: 'RED', from: 1, to: 2 }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'FOULS', side: 'RED', from: 0, to: 2 }])
  })

  test('drops the fouls entry when they end up where they started', () => {
    // act
    const actual = logOf(
      [120, { kind: 'FOULS', side: 'RED', from: 0, to: 1 }],
      [120, { kind: 'FOULS', side: 'RED', from: 1, to: 0 }],
    )
    // assert
    expect(actual).toEqual([])
  })

  test('keeps the fouls of the two fighters apart', () => {
    // act
    const actual = logOf(
      [120, { kind: 'FOULS', side: 'RED', from: 0, to: 1 }],
      [120, { kind: 'FOULS', side: 'BLUE', from: 0, to: 1 }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([
      { kind: 'FOULS', side: 'RED', from: 0, to: 1 },
      { kind: 'FOULS', side: 'BLUE', from: 0, to: 1 },
    ])
  })

  test('groups senchu into the value it ended on', () => {
    // act
    const actual = logOf(
      [120, { kind: 'SENCHU', from: 'NONE', to: 'RED' }],
      [120, { kind: 'SENCHU', from: 'RED', to: 'BLUE' }],
    )
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'SENCHU', from: 'NONE', to: 'BLUE' }])
  })

  test('drops the senchu entry when it is given and taken straight back', () => {
    // act
    const actual = logOf(
      [120, { kind: 'SENCHU', from: 'NONE', to: 'RED' }],
      [120, { kind: 'SENCHU', from: 'RED', to: 'NONE' }],
    )
    // assert
    expect(actual).toEqual([])
  })

  test('leaves the log it was given untouched and returns a new one', () => {
    // arrange
    const log = logOf([120, points('RED', 1)])
    const before = [...log]
    // act - the three branches: a new entry, one grouped in, one that cancels out
    const appended = appendFightEvent(log, { at: 2, fightTime: 119, event: points('BLUE', 1) })
    const grouped = appendFightEvent(log, { at: 3, fightTime: 120, event: points('RED', 1) })
    const dropped = appendFightEvent(log, { at: 4, fightTime: 120, event: points('RED', -1) })
    // assert - a shared reference would make React skip the render and stall the panel
    expect(log).toEqual(before)
    expect(appended).not.toBe(log)
    expect(grouped).not.toBe(log)
    expect(dropped).not.toBe(log)
  })
})

describe('switchFightLogSides', () => {
  test('swaps the corner of points and fouls', () => {
    // arrange
    const log = logOf([120, points('RED', 2)], [119, { kind: 'FOULS', side: 'BLUE', from: 0, to: 1 }])
    // act
    const actual = switchFightLogSides(log)
    // assert
    expect(eventsOf(actual)).toEqual([points('BLUE', 2), { kind: 'FOULS', side: 'RED', from: 0, to: 1 }])
  })

  test('swaps both ends of senchu and leaves NONE alone', () => {
    // arrange
    const log = logOf([120, { kind: 'SENCHU', from: 'NONE', to: 'RED' }])
    // act
    const actual = switchFightLogSides(log)
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'SENCHU', from: 'NONE', to: 'BLUE' }])
  })

  test('swaps the score a reopened fight was carrying', () => {
    // arrange
    const log = logOf([120, { kind: 'REOPEN', redPoints: 3, bluePoints: 1 }])
    // act
    const actual = switchFightLogSides(log)
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'REOPEN', redPoints: 1, bluePoints: 3 }])
  })

  test('leaves the clock events as they are', () => {
    // arrange
    const log = logOf([120, { kind: 'START' }], [119, { kind: 'TIME_SET', from: 119, to: 100 }])
    // act
    const actual = switchFightLogSides(log)
    // assert
    expect(eventsOf(actual)).toEqual([{ kind: 'START' }, { kind: 'TIME_SET', from: 119, to: 100 }])
  })
})

describe('isValidFightLog', () => {
  test('accepts a fight stored before the log existed', () => {
    // act & assert
    expect(isValidFightLog(undefined)).toBe(true)
  })

  test('accepts an empty log and a filled one', () => {
    // act & assert
    expect(isValidFightLog([])).toBe(true)
    expect(isValidFightLog(logOf([120, points('RED', 1)]))).toBe(true)
  })

  test.each([
    { value: null, name: 'null' },
    { value: 'a log', name: 'a string' },
    { value: [{ at: 1, fightTime: 2 }], name: 'an entry without an event' },
    { value: [{ at: 1, fightTime: 2, event: {} }], name: 'an event without a kind' },
    { value: [{ at: '1', fightTime: 2, event: { kind: 'START' } }], name: 'a text timestamp' },
  ])('rejects $name', ({ value }) => {
    // act & assert
    expect(isValidFightLog(value)).toBe(false)
  })
})
