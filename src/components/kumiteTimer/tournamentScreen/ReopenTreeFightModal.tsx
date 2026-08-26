import { JSX, useCallback } from 'react'
import { useSelector } from 'react-redux'
import './ReopenTreeFightModal.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../logic/hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { selectTranslation } from '../../../redux/page/selector'
import { setTournamentFight } from '../../../redux/kumiteTimer/actions'
import { useNavigate } from 'react-router-dom'
import {
  selectKumiteTimerRepechageTree, selectKumiteTimerTournamentFight, selectKumiteTimerTournamentTree,
} from '../../../redux/kumiteTimer/selector'
import { resetsRepechage } from '../../../types/tournament'


export const ReopenTreeFightModal = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { setUpScreen: { tournament: { reopenTreeFightModal: t } } } } = translation
  const fight = useSelector(selectKumiteTimerTournamentFight)
  const tree = useSelector(selectKumiteTimerTournamentTree)
  const repechage = useSelector(selectKumiteTimerRepechageTree)

  // the semifinal wording promises a reset, so it is only said where there is one
  const resets = fight !== null && resetsRepechage(fight, tree, repechage)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const close = useCloseModal()

  const handleStart = useCallback(() => {
    // confirms current selected fight
    void navigate('/kumite-timer')
    close()
  }, [navigate, close])

  const handleClose = useCallback(() => {
    // reset selected fight
    dispatch(setTournamentFight(null))
    close()
  }, [dispatch, close])

  return (
    <div className='reopen-tree-fight-modal'>
      <ModalHeader heading={t.title} onClose={handleClose} />
      <div className='body'>
        {(fight?.type === 'MAIN' && !resets) && t.text}
        {(fight?.type === 'MAIN' && resets) && t.textSemifinal}
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
