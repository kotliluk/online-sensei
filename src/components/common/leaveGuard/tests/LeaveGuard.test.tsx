import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { LeaveGuard } from '../LeaveGuard'
import { PageHeader } from '../../pageHeader/PageHeader'
import { store } from '../../../../redux/store'
import { setLeaveQuestion, setTranslation } from '../../../../redux/page/actions'
import { EN } from '../../../../logic/translation/en'
import { LeaveQuestion } from '../../../../types/leaveQuestion'


const session = EN.leaveScreenModal
const fight = EN.kumiteTimer.timerScreen.leaveFightModal

/**
 * A data router, because that is what `useBlocker` needs - the app's own
 * `<BrowserRouter>` does not provide one, which is the whole reason `src/index.tsx`
 * changed in this ticket.
 */
const renderGuard = (
  leaveQuestion: LeaveQuestion | null,
  entries: string[] = ['/kumite-timer/set-up', '/kumite-timer'],
): ReturnType<typeof createMemoryRouter> => {
  store.dispatch(setLeaveQuestion(leaveQuestion))

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

/**
 * The header and the guard side by side, the way `index.tsx` mounts them. The logo is an
 * ordinary link on every screen now, so the only thing standing between a stray tap and a
 * thrown-away fight is the guard holding the push.
 */
const renderWithHeader = (
  leaveQuestion: LeaveQuestion | null,
): ReturnType<typeof createMemoryRouter> => {
  store.dispatch(setLeaveQuestion(leaveQuestion))

  const router = createMemoryRouter(
    [{ path: '*', element: <><PageHeader /><LeaveGuard /></> }],
    { initialEntries: ['/kumite-timer'] },
  )

  render(
    <ReduxProvider store={store}>
      <RouterProvider router={router} />
    </ReduxProvider>,
  )

  return router
}

const clickLogo = (): void => {
  fireEvent.click(screen.getByRole('link', { name: 'OnlineSensei' }))
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
    expect(screen.queryByRole('heading', { name: session.title })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: fight.title })).not.toBeInTheDocument()
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

  afterEach(() => {
    store.dispatch(setLeaveQuestion(null))
  })

  test('asks before browser back leaves a screen with something to lose', async () => {
    // arrange
    const router = renderGuard('SESSION')

    // act
    await goBack(router)

    // assert
    expect(screen.getByRole('heading', { name: session.title })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer')
  })

  /**
   * A fight can be saved, so its question is about saving rather than about losing, and
   * it borrows the wording ticket 003 already settled on. The generic one would read
   * wrong on a tournament fight, which is exactly what the device check reported.
   */
  test('asks a fight about saving rather than about losing', async () => {
    // arrange
    const router = renderGuard('FIGHT')

    // act
    await goBack(router)

    // assert
    expect(screen.getByRole('heading', { name: fight.title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: fight.confirm })).toBeInTheDocument()
  })

  /**
   * The tournament overview publishes no question: the tree and the group are written to
   * `localStorage` and survive being left, so there is nothing to protect. Neither is a
   * fight nothing has happened in yet.
   */
  test('does not ask when the screen has nothing to lose', async () => {
    // arrange
    const router = renderGuard(null)

    // act
    await goBack(router)

    // assert
    expect(screen.queryByRole('heading', { name: session.title })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer/set-up')
  })

  /**
   * The header bar runs the full width just above the score, so on a phone it is the
   * easiest thing to hit by accident. It stays a working way home - it just does not go
   * quietly while there is a fight on the screen.
   */
  test('asks when the logo takes you home from a screen with something to lose', async () => {
    // arrange
    const router = renderWithHeader('FIGHT')

    // act
    clickLogo()

    // assert
    expect(await screen.findByRole('heading', { name: fight.title })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer')
  })

  test('lets the logo go home when there is nothing to lose', async () => {
    // arrange
    const router = renderWithHeader(null)

    // act
    clickLogo()

    // assert
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
    expect(screen.queryByRole('heading', { name: fight.title })).not.toBeInTheDocument()
  })

  test('leaves once the question is answered yes', async () => {
    // arrange
    const router = renderGuard('SESSION')
    await goBack(router)

    // act
    click(session.confirm)
    await answerSettles()

    // assert
    expect(router.state.location.pathname).toBe('/kumite-timer/set-up')
  })

  test('stays put once the question is answered no', async () => {
    // arrange
    const router = renderGuard('SESSION')
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
    const router = renderGuard('SESSION')
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
  test('lets the app navigate away without asking', async () => {
    // arrange
    const router = renderGuard('SESSION', ['/kumite-timer'])

    // act
    await act(async () => {
      await router.navigate('/kumite-timer/set-up')
    })

    // assert
    expect(screen.queryByRole('heading', { name: session.title })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/kumite-timer/set-up')
  })

  test('asks the browser to confirm closing a screen with something to lose', () => {
    // arrange
    renderGuard('SESSION')

    // act
    const event = fireBeforeUnload()

    // assert
    expect(event.defaultPrevented).toBe(true)
  })

  test('lets a screen with nothing to lose close without a word', () => {
    // arrange
    renderGuard(null)

    // act
    const event = fireBeforeUnload()

    // assert
    expect(event.defaultPrevented).toBe(false)
  })

  /**
   * The listener has to come off the moment there is nothing left to lose, not only on
   * unmount. The guard is mounted for the whole life of the app, so a listener left
   * behind would go on asking about closing the tab from the main page.
   */
  test('stops asking once there is nothing left to lose', () => {
    // arrange
    renderGuard('SESSION')
    expect(fireBeforeUnload().defaultPrevented).toBe(true)

    // act
    act(() => {
      store.dispatch(setLeaveQuestion(null))
    })

    // assert
    expect(fireBeforeUnload().defaultPrevented).toBe(false)
  })
})
