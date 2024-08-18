// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import './CancelTournamentModal.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../logic/hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { selectTranslation } from '../../../redux/page/selector'
import { cancelTournament } from '../../../redux/kumiteTimer/actions'
import { useHistory } from 'react-router-dom'


export const CancelTournamentModal = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { setUpScreen: { tournament: { cancelTournamentModal: t } } } } = translation

  const dispatch = useDispatch()
  const history = useHistory()
  const close = useCloseModal()

  const handleCancel = useCallback(() => {
    dispatch(cancelTournament())
    history.push('/kumite-timer/set-up')
    close()
  }, [dispatch, history, close])

  return (
    <div className='cancel-tournament-modal'>
      <ModalHeader heading={t.title} />
      <div className='body'>
        {t.text}

        <div className='buttons'>
          <Button
            className='footer-btn cancel-btn'
            onClick={handleCancel}
          >
            {translation.common.cancel}
          </Button>
          <Button
            className='footer-btn back-btn'
            onClick={close}
          >
            {translation.common.back}
          </Button>
        </div>
      </div>
    </div>
  )
}
