import { render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { store } from '../redux/store'


const renderAt = (path: string): void => {
  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ReduxProvider>
  )
}

describe('App routing', () => {
  test('renders the main page at /', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1, name: 'OnlineSensei' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /kumite/i })).toBeInTheDocument()
  })

  test('renders a feature page at a top-level route', () => {
    renderAt('/group-stopwatch/set-up')

    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  test('renders a nested route (the react-router v7 splat mount)', () => {
    renderAt('/kumite-timer/set-up')

    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  test('redirects an unknown path back to the main page', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('heading', { level: 1, name: 'OnlineSensei' })).toBeInTheDocument()
  })
})
