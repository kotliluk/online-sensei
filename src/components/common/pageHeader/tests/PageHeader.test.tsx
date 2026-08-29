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
   * The way home works everywhere, including on a screen holding a fight. What stops it
   * from throwing the fight away is `LeaveGuard` holding the navigation and asking, not
   * the header refusing to be a link - so there is nothing here that has to know which
   * screen it is on. See `LeaveGuard.test.tsx` for the click that raises the question.
   */
  test.each<LeaveQuestion | null>([null, 'FIGHT', 'SESSION'])('links home with %s to lose', (question) => {
    // act
    renderHeader(question)

    // assert
    expect(screen.getByRole('link', { name: 'OnlineSensei' })).toHaveAttribute('href', '/')
  })
})
