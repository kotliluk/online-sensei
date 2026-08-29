import { render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from '../PageHeader'
import { store } from '../../../../redux/store'


const renderAt = (path: string): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <PageHeader />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

describe('PageHeader', () => {
  /**
   * The header sits above every route as a full-width strip, on a phone right over the
   * score. While a fight is being kept it is the easiest thing on the screen to hit by
   * accident, and hitting it used to throw the fight away without a word - so on those
   * screens it stops being a link at all.
   */
  test.each([
    '/reactions',
    '/kumite-timer',
    '/kumite-timer/tournament',
    '/interval-timer',
    '/group-stopwatch',
  ])('is not a link at %s', (path) => {
    // act
    renderAt(path)

    // assert
    expect(screen.queryByRole('link', { name: 'OnlineSensei' })).not.toBeInTheDocument()
    expect(screen.getByText('OnlineSensei')).toBeInTheDocument()
  })

  /**
   * Everywhere else the way home is the point. The mirror is in this list rather than the
   * one above because it owns nothing - it only reads what the fight window wrote.
   */
  test.each([
    '/',
    '/kumite-timer/set-up',
    '/kumite-timer/mirror',
    '/group-stopwatch/set-up',
  ])('is a link home at %s', (path) => {
    // act
    renderAt(path)

    // assert
    expect(screen.getByRole('link', { name: 'OnlineSensei' })).toHaveAttribute('href', '/')
  })
})
