import { render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from '../PageHeader'
import { store } from '../../../../redux/store'
import { setLeaveQuestion } from '../../../../redux/page/actions'
import { LeaveQuestion } from '../../../../types/leaveQuestion'


const renderHeader = (leaveQuestion: LeaveQuestion | null): void => {
  store.dispatch(setLeaveQuestion(leaveQuestion))

  render(
    <ReduxProvider store={store}>
      <MemoryRouter>
        <PageHeader />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

describe('PageHeader', () => {
  afterEach(() => {
    store.dispatch(setLeaveQuestion(null))
  })

  /**
   * The header sits above every route as a full-width strip, on a phone right over the
   * score. While a fight is being kept it is the easiest thing on the screen to hit by
   * accident, and hitting it used to throw the fight away without a word.
   *
   * It reads the same answer the leave guard blocks on, so the two cannot disagree about
   * whether this screen has anything to lose.
   */
  test.each<LeaveQuestion>(['FIGHT', 'SESSION'])('is not a link while there is a %s to lose', (question) => {
    // act
    renderHeader(question)

    // assert
    expect(screen.queryByRole('link', { name: 'OnlineSensei' })).not.toBeInTheDocument()
    expect(screen.getByText('OnlineSensei')).toBeInTheDocument()
  })

  /**
   * Set-up screens, the main page, the mirror and the tournament overview all publish no
   * question - the tournament tree is in `localStorage` and survives being left, so there
   * is nothing there to protect and the way home should work.
   */
  test('is a link home when there is nothing to lose', () => {
    // act
    renderHeader(null)

    // assert
    expect(screen.getByRole('link', { name: 'OnlineSensei' })).toHaveAttribute('href', '/')
  })
})
