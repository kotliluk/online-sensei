import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
 * The cross in the modal header, which carries an icon and so has no name to ask for.
 * The header is the only banner on the page here - the guard is rendered on its own,
 * without the app's own header around it.
 */
const clickCross = (): void => {
  fireEvent.click(within(screen.getByRole('banner')).getByRole('button'))
}

/**
 * Both answers take the modal away - yes by proceeding, no by resetting - so waiting for
 * it to go is what gives a navigation that should not happen the time to happen anyway.
 * Asserting the location straight after the click would pass either way: it is still the
 * old one for a tick whatever the answer was.
 */
const answerSettles = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: t.title })).not.toBeInTheDocument()
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
    await answerSettles()

    // assert
    expect(router.state.location.pathname).toBe('/kumite-timer/set-up')
  })

  test('stays put once the question is answered no', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer/set-up', '/kumite-timer'])
    await goBack(router)

    // act
    click(EN.common.back)
    await answerSettles()

    // assert
    expect(router.state.location.pathname).toBe('/kumite-timer')
  })

  /**
   * The cross is an answer, not an escape. It hangs on the shared `ModalHeader`, whose
   * default close dispatches into the redux modal state - which this modal does not use,
   * so left alone it would look like a button that does nothing while the navigation
   * stayed blocked behind it.
   */
  test('treats the cross in the header as answering no', async () => {
    // arrange
    const router = renderGuard(['/kumite-timer/set-up', '/kumite-timer'])
    await goBack(router)

    // act
    clickCross()
    await answerSettles()

    // assert
    expect(router.state.location.pathname).toBe('/kumite-timer')
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
