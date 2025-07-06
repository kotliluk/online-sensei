// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import './SetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useHistory } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { LIMITS, VALIDATOR } from '../../../redux/kumiteTimer/utils'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import {
  selectKumiteTimerCompetitors, selectKumiteTimerCompetitorsCount,
  selectKumiteTimerDuration, selectKumiteTimerIsTournament,
} from '../../../redux/kumiteTimer/selector'
import { setKumiteTimer, setKumiteTimerTournament, setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'
import { Select } from '../../atoms/select/Select'
import { Input } from '../../atoms/input/Input'
import { Competitor, newCompetitor, TournamentType } from '../../../types/tournament'
import { shuffle } from '../../../utils/array'
import { CheckBox } from '../../atoms/checkBox/CheckBox'


export const SetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initDuration = useSelector(selectKumiteTimerDuration)
  const isPreviousTournament = useSelector(selectKumiteTimerIsTournament)
  const initCompetitorsCount = useSelector(selectKumiteTimerCompetitorsCount)
  const initCompetitors = useSelector(selectKumiteTimerCompetitors)

  const [duration, setDuration, isValidDuration] = useValidatedState(initDuration, VALIDATOR.duration)

  const [isTournament, setIsTournament] = useState(false)
  const [tournamentName, setTournamentName] = useState('')
  const [tournamentType, setTournamentType] = useState<TournamentType>('TREE')
  const [competitorsCount, setCompetitorsCount, isCompetitorsCountValid] = useValidatedState<number>(
    initCompetitorsCount,
    VALIDATOR.competitorsCount,
  )
  const [competitors, setCompetitors] = useState(initCompetitors)
  const [shuffleCompetitors, setShuffleCompetitors] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (isCompetitorsCountValid && competitorsCount > competitors.length) {
      const newCompetitors = [...competitors]
      for (let i = competitors.length; i < competitorsCount; i++) {
        newCompetitors[i] = newCompetitor(`${i + 1}`)
      }
      setCompetitors(newCompetitors)
    }
  }, [competitorsCount, isCompetitorsCountValid, competitors])

  const handleCompetitorEdit = useCallback((competitors: Competitor[], index: number, value: string) => {
    const newCompetitors = [...competitors]
    if (!value.includes(',')) {
      newCompetitors[index].name = value
    } else {
      const parts = value.split(',')
      parts.forEach((part, i) => {
        const trimmed = part.trim()
        if (trimmed !== '' && index + i < LIMITS.competitorsCount.max) {
          newCompetitors[index + i].name = trimmed
        }
      })
    }
    setCompetitors(newCompetitors)
  }, [setCompetitors])

  const handleStart = useCallback(() => {
    if (!isTournament) {
      dispatch(setKumiteTimer(duration))
      history.push('/kumite-timer')
    } else {
      const cs = competitors.slice(0, competitorsCount)
      if (shuffleCompetitors) {
        shuffle(cs)
      }
      dispatch(setKumiteTimerTournament(duration, tournamentName, tournamentType, competitorsCount, cs))
      history.push('/kumite-timer/tournament')
    }
  }, [duration, isTournament, tournamentName, tournamentType, shuffleCompetitors, competitorsCount, competitors])

  const handleResumeTournament = useCallback(() => {
    if (isPreviousTournament) {
      history.push('/kumite-timer/tournament')
    }
  }, [dispatch, isPreviousTournament])

  const handleBack = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
    history.push('/')
  }, [dispatch])

  const { kumiteTimer: { setUpScreen: t } } = translation

  return (
    <main className='set-up-kumite-timer'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.duration.label}:</label>
          <NumberInput
            className='set-up-input'
            value={duration}
            onChange={setDuration}
            invalid={!isValidDuration}
            errorMessage={insertWords(t.duration.error, LIMITS.duration.min, LIMITS.duration.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.tournament.newTournament}:</label>
          <CheckBox
            checked={isTournament}
            onChange={setIsTournament}
          />
        </li>

        {isTournament && (
          <>
            <li className='set-up-item'>
              <label>{t.tournament.name}:</label>
              <Input
                className='set-up-input'
                type='text'
                value={tournamentName}
                onChange={setTournamentName}
              />
            </li>

            <li className='set-up-item'>
              <label>{t.tournament.types.label}:</label>
              <Select
                className='set-up-input'
                selected={tournamentType}
                values={[
                  { value: 'TREE', text: t.tournament.types.tree },
                  { value: 'GROUP', text: t.tournament.types.group },
                ]}
                onChange={(value) => setTournamentType(value as TournamentType)}
              />
            </li>

            <li className='set-up-item'>
              <label>{t.tournament.competitorsCount.label}:</label>
              <NumberInput
                className='set-up-input'
                value={competitorsCount}
                onChange={setCompetitorsCount}
                invalid={!isCompetitorsCountValid}
                errorMessage={insertWords(
                  t.tournament.competitorsCount.error,
                  LIMITS.competitorsCount.min,
                  LIMITS.competitorsCount.max,
                )}
              />
            </li>

            {tournamentType === 'TREE' && (
              <li className='set-up-item'>
                <label>{t.tournament.shuffleCompetitors}:</label>
                <CheckBox
                  checked={shuffleCompetitors}
                  onChange={setShuffleCompetitors}
                />
              </li>
            )}

            <li className='set-up-item'>
              <label>{t.tournament.competitors}:</label>
            </li>

            {competitors.slice(0, competitorsCount).map((competitor, index) => (
              <li className='set-up-item no-border' key={`competitor-${index}`}>
                <label>{index + 1}:</label>
                <Input
                  type='text'
                  value={competitor.name}
                  onChange={(value) => handleCompetitorEdit(competitors, index, value)}
                />
              </li>
            ))}
          </>
        )}
      </ul>

      <div className='buttons'>
        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isValidDuration}
        >
          {translation.common.start}
        </Button>

        <Button
          className='resume-tournament-btn'
          onClick={handleResumeTournament}
          disabled={!isPreviousTournament}
        >
          {t.tournament.resumeTournament}
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
