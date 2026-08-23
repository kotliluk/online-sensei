import { setIntervalTimerAdvanced, setIntervalTimerSimple } from '../actions'
import { VALIDATOR } from '../utils'
import { Interval } from '../../../types/interval'


const work = (duration: number): Interval => ({ type: 'work', name: 'W', duration })
const pause = (duration: number): Interval => ({ type: 'pause', name: 'P', duration })

const shape = (intervals: Interval[]): string => intervals.map((i) => `${i.type}:${i.duration}`).join(' ')

beforeEach(() => {
  localStorage.clear()
})

describe('setIntervalTimerSimple', () => {
  test('lays the rounds out as work and pause', () => {
    // act
    const action = setIntervalTimerSimple(2, 30, 10, false, 'NO_BEEP', 0)
    // assert
    expect(shape(action.payload.intervals)).toBe('work:30 pause:10 work:30 pause:10')
  })

  test('drops the trailing pause when asked to', () => {
    // act
    const action = setIntervalTimerSimple(2, 30, 10, true, 'NO_BEEP', 0)
    // assert
    expect(shape(action.payload.intervals)).toBe('work:30 pause:10 work:30')
  })
})

describe('setIntervalTimerAdvanced', () => {
  test('repeats the round as many times as asked', () => {
    // act
    const action = setIntervalTimerAdvanced([work(20), pause(5)], 3, false, 'NO_BEEP', 0)
    // assert
    expect(action.payload.intervals).toHaveLength(6)
  })

  test('drops the trailing pause when the round ends with one', () => {
    // act
    const action = setIntervalTimerAdvanced([work(20), pause(5)], 2, true, 'NO_BEEP', 0)
    // assert
    expect(shape(action.payload.intervals)).toBe('work:20 pause:5 work:20')
  })

  test('keeps the last interval when the round does not end with a pause', () => {
    // act
    const action = setIntervalTimerAdvanced([pause(5), work(20)], 2, true, 'NO_BEEP', 0)
    // assert
    expect(shape(action.payload.intervals)).toBe('pause:5 work:20 pause:5 work:20')
  })

  test('never hands the screen an empty series', () => {
    // arrange - one round of a single pause, with the trailing pause dropped, would leave
    // nothing at all, and the screen reads `intervals[0]` before it renders anything
    // act
    const action = setIntervalTimerAdvanced([pause(5)], 1, true, 'NO_BEEP', 0)
    // assert
    expect(action.payload.intervals.length).toBeGreaterThan(0)
  })

  test('survives a round list that arrived empty from storage', () => {
    // act + assert
    expect(() => setIntervalTimerAdvanced([], 2, true, 'NO_BEEP', 0)).not.toThrow()
  })
})

describe('VALIDATOR.advancedRoundIntervals', () => {
  test('rejects an empty list', () => {
    // arrange - a stored `[]` from another version would otherwise be loaded as a series
    // act + assert
    expect(VALIDATOR.advancedRoundIntervals([])).toBe(false)
  })

  test('rejects a list with an invalid item', () => {
    // act + assert
    expect(VALIDATOR.advancedRoundIntervals([work(20), { bad: true } as never])).toBe(false)
  })

  test('accepts a list of valid intervals', () => {
    // act + assert
    expect(VALIDATOR.advancedRoundIntervals([work(20), pause(5)])).toBe(true)
  })
})
