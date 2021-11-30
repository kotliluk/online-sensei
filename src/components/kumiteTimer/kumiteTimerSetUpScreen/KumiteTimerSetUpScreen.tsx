// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './KumiteTimerSetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useHistory } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { LIMITS, VALIDATOR } from '../../../redux/kumiteTimer/utils'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import { selectKumiteTimerDuration } from '../../../redux/kumiteTimer/selector'
import { setKumiteTimer } from '../../../redux/kumiteTimer/actions'


export const KumiteTimerSetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initDuration = useSelector(selectKumiteTimerDuration)

  const [duration, setDuration, isValidDuration] = useValidatedState(initDuration, VALIDATOR.duration)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleStart = useCallback(() => {
    dispatch(setKumiteTimer(duration))
    history.push('/kumite-timer')
  }, [dispatch, duration])

  const handleBack = useCallback(() => {
    history.push('/')
  }, [dispatch])

  // TODO - translations
  // const { reactions: { setUpScreen: t } } = translation

  return (
    <main className='set-up-kumite-timer'>
      <h1>Kumite timer</h1>

      <div className='set-up-items'>
        <div className='set-up-item'>
          <label>Duration:</label>
          <NumberInput
            className='set-up-input'
            value={duration}
            onChange={setDuration}
            invalid={!isValidDuration}
            errorMessage={insertWords('TODO error translation', LIMITS.duration.min, LIMITS.duration.max)}
          />
        </div>
      </div>

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
