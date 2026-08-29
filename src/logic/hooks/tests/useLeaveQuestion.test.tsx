import { JSX, ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { useLeaveQuestion } from '../useLeaveQuestion'
import { store } from '../../../redux/store'
import { setLeaveQuestion } from '../../../redux/page/actions'
import { LeaveQuestion } from '../../../types/leaveQuestion'


const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
)

const published = (): LeaveQuestion | null => store.getState().page.leaveQuestion

describe('useLeaveQuestion', () => {
  afterEach(() => {
    store.dispatch(setLeaveQuestion(null))
  })

  test.each<LeaveQuestion>(['FIGHT', 'SESSION'])('publishes %s while the screen has it to lose', (question) => {
    // act
    renderHook(() => useLeaveQuestion(question), { wrapper })

    // assert
    expect(published()).toBe(question)
  })

  test('publishes nothing for a screen with nothing to lose', () => {
    // act
    renderHook(() => useLeaveQuestion(null), { wrapper })

    // assert
    expect(published()).toBeNull()
  })

  /**
   * The same screen changes its mind as a fight is played, and the guard has to follow -
   * this is the whole reason the question is state rather than a list of paths.
   */
  test('follows the screen when it changes its mind', () => {
    // arrange
    const { rerender } = renderHook(
      ({ question }: { question: LeaveQuestion | null }) => useLeaveQuestion(question),
      { wrapper, initialProps: { question: null as LeaveQuestion | null } },
    )

    // act
    rerender({ question: 'FIGHT' })

    // assert
    expect(published()).toBe('FIGHT')
  })

  /**
   * Without this a screen that unmounts leaves its question hanging over whatever comes
   * next - the set-up screen it just redirected to would refuse to be left.
   */
  test('clears the question on the way out', () => {
    // arrange
    const { unmount } = renderHook(() => useLeaveQuestion('SESSION'), { wrapper })
    expect(published()).toBe('SESSION')

    // act
    unmount()

    // assert
    expect(published()).toBeNull()
  })
})
