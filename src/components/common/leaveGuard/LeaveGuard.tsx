import { JSX, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BlockerFunction, NavigationType, useBlocker } from 'react-router-dom'
import './LeaveGuard.scss'
import { ModalHeader } from '../modal/modalHeader/ModalHeader'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import { selectLeaveQuestion, selectTranslation } from '../../../redux/page/selector'


/**
 * Holds the two ways out of a running screen that no screen can see: the browser's back
 * button (and the phone's back gesture, which is the same thing) and closing the tab.
 *
 * It hangs beside `ModalContainer` rather than on the screens, and asks each screen only
 * one thing - `useLeaveQuestion` - so the screens stay in charge of what is worth losing.
 *
 * It renders its own modal instead of going through the redux `modalWindow`: what the
 * buttons have to call is `proceed` and `reset` off a live blocker, and functions bound
 * to one particular blocked navigation do not belong in a serialisable store.
 */
export const LeaveGuard = (): JSX.Element | null => {
  const leaveQuestion = useSelector(selectLeaveQuestion)
  const translation = useSelector(selectTranslation)
  /**
   * Two ways out, and only while the screen showing says it has something to lose.
   *
   * **A pop** is the browser's own back or forward, including the phone's back gesture.
   * Saving a fight, the screens' Back buttons and the redirect that follows
   * `setNotActual*` all navigate through the same router, and none of them may be
   * interrupted by a question - but they push and replace, so nothing on the screens has
   * to be kept in sync for the guard to tell them apart.
   *
   * **A push to `/`** is the logo in the header, and only the logo. Every other way the
   * app reaches the main page is a `navigate('/')` on a set-up screen, where there is
   * nothing to lose and this predicate is false anyway, and the catch-all route replaces
   * rather than pushes. So the header can stay a working link and still ask first.
   */
  const shouldBlock = useCallback<BlockerFunction>(
    ({ historyAction, nextLocation }) => {
      if (leaveQuestion === null) {
        return false
      }

      return historyAction === NavigationType.Pop
        || (historyAction === NavigationType.Push && nextLocation.pathname === '/')
    },
    [leaveQuestion],
  )

  const blocker = useBlocker(shouldBlock)

  /**
   * A fight can be saved, so its question is about saving and borrows the wording ticket
   * 003 already settled on. Nothing on the other screens is saved anywhere, so theirs can
   * only be about losing it.
   */
  const t = leaveQuestion === 'FIGHT'
    ? translation.kumiteTimer.timerScreen.leaveFightModal
    : translation.leaveScreenModal

  /**
   * The browser's own dialog cannot be worded and on a phone may not appear at all -
   * Chrome shows it only after a real interaction, Safari on iOS has historically
   * ignored it. It is the last fallback, not the main road.
   */
  useEffect(() => {
    if (leaveQuestion === null) {
      return
    }

    const askBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', askBeforeUnload)

    return () => window.removeEventListener('beforeunload', askBeforeUnload)
  }, [leaveQuestion])

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
              {translation.common.back}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ), root)
}
