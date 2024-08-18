// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import './TournamentScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { selectKumiteTimerTournamentName, selectKumiteTimerTournamentType } from '../../../redux/kumiteTimer/selector'
import { TreeTournamentScreen } from './TreeTournamentScreen'
import { GroupTournamentScreen } from './GroupTournamentScreen'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { setModalWindow } from '../../../redux/page/actions'


export const TournamentScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const tournamentName = useSelector(selectKumiteTimerTournamentName)
  const tournamentType = useSelector(selectKumiteTimerTournamentType)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleCancel = useCallback(() => {
    dispatch(setModalWindow('CANCEL_TOURNAMENT'))
  }, [dispatch])

  const handleBack = useCallback(() => {
    history.push('/kumite-timer/set-up')
  }, [dispatch])

  return (
    <main className='tournament-screen'>
      <h1>{translation.kumiteTimer.setUpScreen.tournament.label}: {tournamentName}</h1>

      {tournamentType === 'TREE' ? <TreeTournamentScreen /> : <GroupTournamentScreen />}

      <div className='buttons'>
        <Button
          className='cancel-btn'
          onClick={handleCancel}
        >
          {translation.common.cancel}
        </Button>

        <Button
          className='back-btn'
          onClick={handleBack}
        >
          {translation.common.back}
        </Button>
      </div>
    </main>
  )
}
