import { JSX, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BlockerFunction, NavigationType, useBlocker, useLocation } from 'react-router-dom'
import './LeaveGuard.scss'
import { ModalHeader } from '../modal/modalHeader/ModalHeader'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { isGuardedPath } from '../../../logic/navigation/guardedPaths'


/**
 * Only the browser's own back and forward, never the app's.
 *
 * Saving a fight, the screens' Back buttons and the redirect that follows
 * `setNotActual*` all navigate through the same router, and none of them may be
 * interrupted by a question. Telling them apart needs nothing the screens have to keep
 * in sync, because the router already says which is which: the app pushes and replaces,
 * the browser pops.
 */
const shouldBlock: BlockerFunction = ({ currentLocation, historyAction }) => {
  return historyAction === NavigationType.Pop && isGuardedPath(currentLocation.pathname)
}

/**
 * Holds the two ways out of a running screen that no screen can see: the browser's back
 * button (and the phone's back gesture, which is the same thing) and closing the tab.
 *
 * It hangs beside `ModalContainer` rather than on the five screens, so none of them
 * changed for this. It also renders its own modal instead of going through the redux
 * `modalWindow`: what the buttons have to call is `proceed` and `reset` off a live
 * blocker, and functions bound to one particular blocked navigation do not belong in
 * a serialisable store.
 */
export const LeaveGuard = (): JSX.Element | null => {
  const { pathname } = useLocation()
  const guarded = isGuardedPath(pathname)

  const { leaveScreenModal: t, common } = useSelector(selectTranslation)
  const blocker = useBlocker(shouldBlock)

  /**
   * The browser's own dialog cannot be worded and on a phone may not appear at all -
   * Chrome shows it only after a real interaction, Safari on iOS has historically
   * ignored it. It is the last fallback, not the main road.
   */
  useEffect(() => {
    if (!guarded) {
      return
    }

    const askBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', askBeforeUnload)

    return () => window.removeEventListener('beforeunload', askBeforeUnload)
  }, [guarded])

  const leave = useCallback(() => blocker.proceed?.(), [blocker])
  const stay = useCallback(() => blocker.reset?.(), [blocker])

  if (blocker.state !== 'blocked') {
    return null
  }

  const root = document.getElementById('modal-root')

  if (root === null) {
    return null
  }

  return ReactDOM.createPortal((
    <div className='modal-container'>
      <div className='leave-screen-modal'>
        <ModalHeader heading={t.title} onClose={stay} />
        <div className='body'>
          {t.text}

          <div className='buttons'>
            <Button
              className='footer-btn cancel-btn'
              onClick={leave}
            >
              {t.confirm}
            </Button>
            <Button
              className='footer-btn back-btn'
              onClick={stay}
            >
              {common.back}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ), root)
}
