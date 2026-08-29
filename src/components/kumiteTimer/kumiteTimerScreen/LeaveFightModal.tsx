import { JSX, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './LeaveFightModal.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../logic/hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { selectKumiteTimerTournamentFight } from '../../../redux/kumiteTimer/selector'
import { setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'


/**
 * Asked before Back throws away a fight that has already been played.
 *
 * The leaving happens here rather than back on the screen: the screen only
 * decides that the question is worth asking, and whoever answers it is the one
 * who knows what the answer was.
 */
export const LeaveFightModal = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { timerScreen: { leaveFightModal: t } } } = translation

  const tournamentFight = useSelector(selectKumiteTimerTournamentFight)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const close = useCloseModal()

  // a fight outside a tournament has no tree to go back to, only the set-up it came from
  const handleLeave = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
    void navigate(tournamentFight ? '/kumite-timer/tournament' : '/kumite-timer/set-up')
    close()
  }, [dispatch, navigate, close, tournamentFight])

  return (
    <div className='leave-fight-modal'>
      <ModalHeader heading={t.title} />
      <div className='body'>
        {t.text}

        <div className='buttons'>
          <Button
            className='footer-btn cancel-btn'
            onClick={handleLeave}
          >
            {t.confirm}
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
