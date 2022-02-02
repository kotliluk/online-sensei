// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
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
import { selectKumiteTimerAtoshibaraku, selectKumiteTimerDuration } from '../../../redux/kumiteTimer/selector'
import { setKumiteTimer, setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'


export const SetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initDuration = useSelector(selectKumiteTimerDuration)
  const initAtoshibaraku = useSelector(selectKumiteTimerAtoshibaraku)

  const [duration, setDuration, isValidDuration] = useValidatedState(initDuration, VALIDATOR.duration)
  const [atoshibaraku, setAtoshibaraku, isValidAtoshibaraku] = useValidatedState(
    initAtoshibaraku,
    VALIDATOR.atoshibaraku,
  )

  const dispatch = useDispatch()
  const history = useHistory()

  const handleStart = useCallback(() => {
    dispatch(setKumiteTimer(duration, atoshibaraku))
    history.push('/kumite-timer')
  }, [dispatch, duration, atoshibaraku])

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
          <label>{t.atoshibaraku.label}:</label>
          <NumberInput
            className='set-up-input'
            value={atoshibaraku}
            onChange={setAtoshibaraku}
            invalid={!isValidAtoshibaraku}
            errorMessage={insertWords(t.atoshibaraku.error, LIMITS.atoshibaraku.min, LIMITS.atoshibaraku.max)}
          />
        </li>
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
          className='back-btn'
          onClick={handleBack}
        >
          {translation.common.back}
        </Button>
      </div>
    </main>
  )
}
