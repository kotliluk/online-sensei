import { reducer } from '../reducer'
import { initialState } from '../state'
import { setModalWindow, setTheme, setTranslation } from '../actions'
import { CS } from '../../../logic/translation/cs'


beforeEach(() => {
  localStorage.clear()
})

/**
 * These three actions share one `case` body by falling through to it. That is the shape
 * where a label can be lost to a single deleted line with nothing else moving and the
 * action quietly starts falling through to `default` instead - which returns the state it
 * was handed, so the screen simply stops responding rather than breaking loudly.
 *
 * What each case pins is therefore not what the spread does. It is that the action still
 * arrives at it.
 */
describe('page reducer', () => {
  test.each([
    { name: 'the theme', action: () => setTheme('dark'), expected: { theme: 'dark' } },
    { name: 'the language', action: () => setTranslation('CS'), expected: { language: 'CS', translation: CS } },
    { name: 'the modal window', action: () => setModalWindow('LEAVE_FIGHT'), expected: { modalWindow: 'LEAVE_FIGHT' } },
  ])('takes $name from the action', ({ action, expected }) => {
    // act
    const state = reducer(initialState, action())
    // assert - the payload landed, and the reducer did not just hand back what it was given
    expect(state).toMatchObject(expected)
    expect(state).not.toBe(initialState)
  })
})
