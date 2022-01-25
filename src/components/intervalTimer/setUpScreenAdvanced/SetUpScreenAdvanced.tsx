// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SetUpScreenAdvanced.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useHistory } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { Select } from '../../atoms/select/Select'
import { VolumeInput } from '../../atoms/input/VolumeInput'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import {
  selectIntervalTimerAdvancedRoundIntervals,
  selectIntervalTimerAdvancedRounds,
  selectIntervalTimerAudioSound,
  selectIntervalTimerAudioVolume,
  selectIntervalTimerSkipLastPause,
} from '../../../redux/intervalTimer/selector'
import { LIMITS, VALIDATOR } from '../../../redux/intervalTimer/utils'
import { setIntervalTimerAdvanced } from '../../../redux/intervalTimer/actions'
import { BEEP_A, BeepType, getBeepName, NO_BEEP } from '../../../types/beepType'
import { preloadBeep } from '../../../logic/audio/beep'


export const SetUpScreenAdvanced = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initIntervals = useSelector(selectIntervalTimerAdvancedRoundIntervals)
  const initRounds = useSelector(selectIntervalTimerAdvancedRounds)
  const initAudioSound = useSelector(selectIntervalTimerAudioSound)
  const initAudioVolume = useSelector(selectIntervalTimerAudioVolume)
  const initSkipLastPause = useSelector(selectIntervalTimerSkipLastPause)

  const [intervals, setIntervals, isValidIntervals] = useValidatedState(initIntervals, VALIDATOR.advancedRoundIntervals)
  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATOR.advancedRounds)
  const [audioSound, setAudioSound] = useState(initAudioSound)
  const [audioVolume, setAudioVolume] = useState(initAudioVolume)
  const [skipLastPause, setSkipLastPause] = useState(initSkipLastPause)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleAudioChange = useCallback((newValue: string) => {
    preloadBeep(newValue as BeepType)
    setAudioSound(newValue as BeepType)
  }, [setAudioSound])

  const handleGoToBasicSettings = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    history.push('/interval-timer/set-up')
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

  const handleStart = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    history.push('/interval-timer')
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

  const handleBack = useCallback(() => {
    history.push('/')
  }, [dispatch])

  const { intervalTimer: { setUpScreenAdvanced: t } } = translation

  return (
    <main className='set-up-interval-timer-advanced'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.series.label}:</label>
          <NumberInput
            className='set-up-input'
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.series.error, LIMITS.advancedRounds.min, LIMITS.advancedRounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{translation.common.sound}:</label>
          <div className='set-up-volume'>
            <Select
              className='set-up-volume-select'
              selected={audioSound}
              values={[
                { value: NO_BEEP, text: translation.common.noSound },
                { value: BEEP_A, text: getBeepName(BEEP_A) },
              ]}
              onChange={handleAudioChange}
            />
            <VolumeInput
              inputClassName='set-up-volume-input'
              buttonClassName='set-up-volume-mute'
              value={audioVolume}
              onChange={setAudioVolume}
              disabled={audioSound === NO_BEEP}
            />
            {/* <Button
              className='set-up-volume-try'
              onClick={handleTryAudio}
              disabled={audioSound === NO_BEEP}
            >
              Try
            </Button> */}
          </div>
        </li>

        <li className='set-up-item'>
          <label>{t.skipLastPause.label}:</label>
          <CheckBox
            // className='set-up-input'
            checked={skipLastPause}
            onChange={setSkipLastPause}
          />
        </li>
      </ul>

      <div className='buttons'>
        <Button
          className='basic-settings-btn'
          onClick={handleGoToBasicSettings}
        >
          {t.basicSettingsBtn}
        </Button>

        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isValidIntervals || !isValidRounds}
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
