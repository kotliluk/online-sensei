import { reducer } from '../reducer'
import { initialState } from '../state'
import {
  deleteSavedAdvancedSeries,
  loadAdvancedSeries,
  saveAdvancedSeries,
  setIntervalTimerAdvanced,
  setIntervalTimerSimple,
} from '../actions'
import { LS_ACCESS } from '../utils'
import { Series } from '../../../types/series'
import { NO_BEEP } from '../../../types/beepType'


const series = (name: string): Series => ({
  name,
  intervals: [{ type: 'work', name: 'W', duration: 20 }],
  rounds: 2,
  skipLastPause: false,
  audioSound: NO_BEEP,
  audioVolume: 0.5,
})

/**
 * The two series cases seed the list through storage rather than by calling
 * `saveAdvancedSeries` twice. With nothing stored, the reader hands back
 * `initialState.advancedSavedSeries` itself and the action pushes into it, so the module's
 * initial state keeps whatever a previous case saved. That is a defect of its own and not
 * this ticket's to fix; seeding round it keeps these cases about the reducer.
 */
const storedSeries = (...saved: Series[]): void => {
  LS_ACCESS.advancedSavedSeries.set(saved)
}

beforeEach(() => {
  localStorage.clear()
})

/**
 * Five actions share one `case` body by falling through to it - two ways of setting the
 * timer up and three ways of moving saved series around. That is the shape where a label
 * can be lost to a single deleted line with nothing else moving, and the action then falls
 * through to `default`, which returns the state it was handed: the set-up screen would
 * simply stop taking what the user typed.
 *
 * What each case pins is therefore not what the spread does. It is that the action still
 * arrives at it.
 */
describe('interval timer reducer', () => {
  test.each([
    {
      name: 'a simple set up',
      action: () => setIntervalTimerSimple(3, 40, 20, false, NO_BEEP, 0.25),
      expected: { simpleRounds: 3, simpleWork: 40, simplePause: 20 },
    },
    {
      name: 'an advanced set up',
      action: () => setIntervalTimerAdvanced(series('a').intervals, 4, false, NO_BEEP, 0.25),
      expected: { advancedRounds: 4, audioVolume: 0.25 },
    },
    {
      name: 'a loaded series',
      action: () => loadAdvancedSeries(series('loaded')),
      expected: { advancedRounds: 2, audioVolume: 0.5 },
    },
    {
      name: 'a saved series',
      action: () => {
        storedSeries()
        return saveAdvancedSeries(series('saved'))
      },
      expected: { advancedSavedSeries: [series('saved')] },
    },
    {
      name: 'a deleted series',
      action: () => {
        storedSeries(series('kept'), series('dropped'))
        return deleteSavedAdvancedSeries(1)
      },
      expected: { advancedSavedSeries: [series('kept')] },
    },
  ])('takes $name from the action', ({ action, expected }) => {
    // act
    const state = reducer(initialState, action())
    // assert - the payload landed, and the reducer did not just hand back what it was given
    expect(state).toMatchObject(expected)
    expect(state).not.toBe(initialState)
  })
})
