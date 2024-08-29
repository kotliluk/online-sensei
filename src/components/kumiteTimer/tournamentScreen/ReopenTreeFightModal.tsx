// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import './ReopenTreeFightModal.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../logic/hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { selectTranslation } from '../../../redux/page/selector'
import { setTournamentFight } from '../../../redux/kumiteTimer/actions'
import { useHistory } from 'react-router-dom'
import { selectKumiteTimerTournamentFight } from '../../../redux/kumiteTimer/selector'


export const ReopenTreeFightModal = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { setUpScreen: { tournament: { reopenTreeFightModal: t } } } } = translation
  const fight = useSelector(selectKumiteTimerTournamentFight)

  const dispatch = useDispatch()
  const history = useHistory()
  const close = useCloseModal()

  const handleStart = useCallback(() => {
    // confirms current selected fight
    history.push('/kumite-timer')
    close()
  }, [history, close])

  const handleClose = useCallback(() => {
    // reset selected fight
    dispatch(setTournamentFight(null))
    close()
  }, [dispatch, close])

  return (
    <div className='reopen-tree-fight-modal'>
      <ModalHeader heading={t.title} onClose={handleClose} />
      <div className='body'>
        {(fight?.type === 'MAIN' && fight?.depth !== 1) && t.text}
        {(fight?.type === 'MAIN' && fight?.depth === 1) && t.textSemifinal}
        {(fight?.type === 'REPECHAGE_1' || fight?.type === 'REPECHAGE_2') && t.textRepechage}

        <div className='buttons'>
          <Button
            className='footer-btn start-btn'
            onClick={handleStart}
          >
            {translation.common.start}
          </Button>
          <Button
            className='footer-btn back-btn'
            onClick={handleClose}
          >
            {translation.common.back}
          </Button>
        </div>
      </div>
    </div>
  )
}
