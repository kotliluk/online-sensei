// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import './FightResultModal.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../logic/hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch, useThunkDispatch } from '../../../redux/useDispatch'
import { selectTranslation } from '../../../redux/page/selector'
import { saveTournamentFight } from '../../../redux/kumiteTimer/actions'
import { useHistory } from 'react-router-dom'
import { selectKumiteTimerTournamentFight, selectKumiteTimerTournamentType } from '../../../redux/kumiteTimer/selector'
import { Select } from '../../atoms/select/Select'
import { FightWinner } from '../../../types/tournament'


export const FightResultModal = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { setUpScreen: { tournament: { fightResultModal: t } } } } = translation

  const tournamentFight = useSelector(selectKumiteTimerTournamentFight)
  const tournamentType = useSelector(selectKumiteTimerTournamentType)

  const [winner, setWinner] = useState<FightWinner>('RED')

  const dispatch = useDispatch()
  const thunkDispatch = useThunkDispatch()
  const history = useHistory()
  const close = useCloseModal()

  useEffect(() => {
    if (!tournamentFight) {
      close()
    } else {
      if (tournamentFight.redFouls === 5) {
        setWinner('BLUE')
      } else if (tournamentFight.blueFouls === 5) {
        setWinner('RED')
      } else if (tournamentFight.redPoints > tournamentFight.bluePoints) {
        setWinner('RED')
      } else if (tournamentFight.bluePoints > tournamentFight.redPoints) {
        setWinner('BLUE')
      } else if (tournamentFight.senchu === 'RED') {
        setWinner('RED')
      } else if (tournamentFight.senchu === 'BLUE') {
        setWinner('RED')
      } else if (tournamentType === 'GROUP') {
        setWinner('DRAW')
      } else {
        setWinner('RED')
      }
    }
  }, [tournamentFight, tournamentType, setWinner])

  const handleConfirm = useCallback(() => {
    if (!tournamentFight) {
      return
    }

    thunkDispatch(saveTournamentFight({
      uuid: tournamentFight.uuid,
      type: tournamentFight.type,
      oppositeFight: tournamentFight.oppositeFight,
      winner: winner,
      redPoints: tournamentFight.redPoints,
      redFouls: tournamentFight.redFouls,
      bluePoints: tournamentFight.bluePoints,
      blueFouls: tournamentFight.blueFouls,
      senchu: tournamentFight.senchu,
    }))
    history.push('/kumite-timer/tournament')
    close()
  }, [dispatch, history, close, tournamentFight, winner])

  const akaText = `AKA (${tournamentFight?.redName})`
  const aoText = `AO (${tournamentFight?.blueName})`

  const winnerChoices = (tournamentType === 'GROUP')
    ? [{ value: 'RED', text: akaText }, { value: 'BLUE', text: aoText }, { value: 'DRAW', text: t.draw }]
    : [{ value: 'RED', text: akaText }, { value: 'BLUE', text: aoText }]

  return (
    <div className='fight-result-modal'>
      <ModalHeader heading={t.title} />
      <div className='body'>
        <div className='result-select'>
          {t.text}
          <Select
            selected={winner}
            values={winnerChoices}
            onChange={(value) => setWinner(value as FightWinner)}
          />
        </div>

        <div className='buttons'>
          <Button
            className='footer-btn confirm-btn'
            onClick={handleConfirm}
          >
            {translation.common.save}
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
