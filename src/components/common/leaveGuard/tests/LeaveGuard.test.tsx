import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { LeaveGuard } from '../LeaveGuard'
import { store } from '../../../../redux/store'
import { setTranslation } from '../../../../redux/page/actions'
import { EN } from '../../../../logic/translation/en'


const t = EN.leaveScreenModal

/**
 * A data router, because that is what `useBlocker` needs - the app's own
 * `<BrowserRouter>` does not provide one, which is the whole reason `src/index.tsx`
 * changed in this ticket.
 */
const renderGuard = (entries: string[]): ReturnType<typeof createMemoryRouter> => {
  const router = createMemoryRouter(
    [{ path: '*', element: <LeaveGuard /> }],
    { initialEntries: entries, initialIndex: entries.length - 1 },
  )

  render(
    <ReduxProvider store={store}>
      <RouterProvider router={router} />
    </ReduxProvider>,
  )

  return router
}

const goBack = async (router: ReturnType<typeof createMemoryRouter>): Promise<void> => {
  await act(async () => {
    await router.navigate(-1)
  })
}

const click = (name: string): void => {
  fireEvent.click(screen.getByRole('button', { name }))
}

/**
 * Answering the question calls `proceed()` or `reset()`, and what they set in motion
 * lands a tick later - reading the location straight after the click gives the old one
 * back.
 */
const expectPathname = async (
  router: ReturnType<typeof createMemoryRouter>,
  pathname: string,
): Promise<void> => {
  await waitFor(() => {
    expect(router.state.location.pathname).toBe(pathname)
  })
}

const fireBeforeUnload = (): Event => {
  const event = new Event('beforeunload', { cancelable: true })

  act(() => {
    window.dispatchEvent(event)
  })

  return event
}

describe('LeaveGuard', () => {
  beforeEach(() => {
    store.dispatch(setTranslation('EN'))
  })

  test('asks before browser back leaves a guarded screen', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer/set-up', '/kumite-timer'])

    // act
    await goBack(router)

    // assert
    expect(screen.getByRole('heading', { name: t.title })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer')
  })

  test('leaves once the question is answered yes', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer/set-up', '/kumite-timer'])
    await goBack(router)

    // act
    click(t.confirm)

    // assert
    await expectPathname(router, '/kumite-timer/set-up')
    expect(screen.queryByRole('heading', { name: t.title })).not.toBeInTheDocument()
  })

  test('stays put once the question is answered no', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer/set-up', '/kumite-timer'])
    await goBack(router)

    // act
    click(EN.common.back)

    // assert
    await expectPathname(router, '/kumite-timer')
    expect(screen.queryByRole('heading', { name: t.title })).not.toBeInTheDocument()
  })

  /**
   * The one that matters most. Saving a fight, the screen's own Back button and the
   * redirect after `setNotActual*` all navigate through the router, and none of them
   * may be interrupted by a question. They are told apart from a real Back by the
   * history action rather than by any flag the screens would have to keep: the app
   * pushes, the browser pops.
   */
  test('lets the app navigate away from a guarded screen without asking', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer'])

    // act
    await act(async () => {
      await router.navigate('/kumite-timer/set-up')
    })

    // assert
    expect(screen.queryByRole('heading', { name: t.title })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer/set-up')
  })

  test('does not ask when back leaves a screen with nothing to lose', async () => {
    // arrange
    const router = renderGuard(['/', '/kumite-timer/set-up'])

    // act
    await goBack(router)

    // assert
    expect(screen.queryByRole('heading', { name: t.title })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  test('asks the browser to confirm closing a guarded screen', () => {
    // arrange
    renderGuard(['/group-stopwatch'])

    // act
    const event = fireBeforeUnload()

    // assert
    expect(event.defaultPrevented).toBe(true)
  })

  test('lets a screen with nothing to lose close without a word', () => {
    // arrange
    renderGuard(['/group-stopwatch/set-up'])

    // act
    const event = fireBeforeUnload()

    // assert
    expect(event.defaultPrevented).toBe(false)
  })

  /**
   * The listener has to come off on the way out, not only on unmount. The guard is
   * mounted for the whole life of the app, so a listener left behind would go on
   * asking about closing the tab from the main page for the rest of the session.
   */
  test('stops asking once the guarded screen is left', async () => {
    // arrange
    const router = renderGuard(['/group-stopwatch'])
    expect(fireBeforeUnload().defaultPrevented).toBe(true)

    // act
    await act(async () => {
      await router.navigate('/group-stopwatch/set-up')
    })

    // assert
    expect(fireBeforeUnload().defaultPrevented).toBe(false)
  })
})
