import { JSX, useCallback, useEffect, useRef, useState } from 'react'
import './ShareButton.scss'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'


// long enough to read, short enough not to still claim "current set up" after
// the user has gone on editing
const MESSAGE_TIMEOUT = 5000

interface ShareButtonProps {
  /** Called on click - builds the link from the set-up state as it is right now. */
  buildUrl: () => string
  disabled?: boolean
}

export const ShareButton = ({ buildUrl, disabled }: ShareButtonProps): JSX.Element => {
  const { common: t } = useSelector(selectTranslation)

  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(timeout.current)
  }, [])

  const showMessage = useCallback((next: 'copied' | 'failed') => {
    setState(next)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setState('idle'), MESSAGE_TIMEOUT)
  }, [])

  const handleShare = useCallback(() => {
    // `navigator.clipboard` is marked `[SecureContext]`, so over plain http the property is
    // not merely unusable - it is absent, and reaching through it throws where it stands,
    // before there is any promise for `.catch` to be attached to. This app gets opened over
    // http from the local network all the time, which is what `yarn dev:https` is for, and
    // a button that neither copies nor complains reads as a broken button.
    if (navigator.clipboard === undefined) {
      showMessage('failed')
      return
    }

    navigator.clipboard.writeText(buildUrl())
      .then(() => showMessage('copied'))
      .catch(() => showMessage('failed'))
  }, [buildUrl, showMessage])

  return (
    <div className='share'>
      <Button className='share-btn' onClick={handleShare} disabled={disabled}>
        {t.share}
      </Button>

      {state !== 'idle' && (
        <span className={`share-message ${state === 'failed' ? 'share-message--failed' : ''}`} role='status'>
          {state === 'copied' ? t.shareCopied : t.shareFailed}
        </span>
      )}
    </div>
  )
}
