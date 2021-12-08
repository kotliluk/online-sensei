// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './SetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useHistory } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import {
  selectIntervalTimerSimplePause,
  selectIntervalTimerSimpleRounds,
  selectIntervalTimerSimpleWork,
} from '../../../redux/intervalTimer/selector'
import { LIMITS, VALIDATOR } from '../../../redux/intervalTimer/utils'
import { setIntervalTimer } from '../../../redux/intervalTimer/actions'


export const SetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initRounds = useSelector(selectIntervalTimerSimpleRounds)
  const initWork = useSelector(selectIntervalTimerSimpleWork)
  const initPause = useSelector(selectIntervalTimerSimplePause)

  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATOR.simpleRounds)
  const [work, setWork, isValidWork] = useValidatedState(initWork, VALIDATOR.simpleWork)
  const [pause, setPause, isValidPause] = useValidatedState(initPause, VALIDATOR.simplePause)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleStart = useCallback(() => {
    dispatch(setIntervalTimer(rounds, work, pause))
    history.push('/interval-timer')
  }, [dispatch, rounds, work, pause])

  const handleBack = useCallback(() => {
    history.push('/')
  }, [dispatch])

  const { intervalTimer: { setUpScreen: t } } = translation

  return (
    <main className='set-up-reactions'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.rounds.label}:</label>
          <NumberInput
            className='set-up-input'
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.rounds.error, LIMITS.simpleRounds.min, LIMITS.simpleRounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.workInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={work}
            onChange={setWork}
            invalid={!isValidWork}
            errorMessage={insertWords(t.workInterval.error, LIMITS.simpleWork.min, LIMITS.simpleWork.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.pauseInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={pause}
            onChange={setPause}
            invalid={!isValidPause}
            errorMessage={insertWords(t.pauseInterval.error, LIMITS.simplePause.min, LIMITS.simplePause.max)}
          />
        </li>
      </ul>

      <div className='buttons'>
        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isValidRounds || !isValidWork || !isValidPause}
        >
          {translation.common.start}
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
