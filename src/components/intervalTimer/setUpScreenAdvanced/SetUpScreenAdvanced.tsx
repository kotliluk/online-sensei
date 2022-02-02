// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
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
  selectIntervalTimerAdvancedLastLoadTime,
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
import { SetUpAdvancedInterval } from '../setUpAdvancedInterval/SetUpAdvancedInterval'
import { Interval, IntervalType } from '../../../types/interval'
import { setModalWindow } from '../../../redux/page/actions'


export const SetUpScreenAdvanced = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const { intervalTimer: { setUpScreenAdvanced: t } } = translation

  const initIntervals = useSelector(selectIntervalTimerAdvancedRoundIntervals)
  const initRounds = useSelector(selectIntervalTimerAdvancedRounds)
  const initAudioSound = useSelector(selectIntervalTimerAudioSound)
  const initAudioVolume = useSelector(selectIntervalTimerAudioVolume)
  const initSkipLastPause = useSelector(selectIntervalTimerSkipLastPause)
  const lastLoadTime = useSelector(selectIntervalTimerAdvancedLastLoadTime)

  const [intervals, setIntervals, isValidIntervals] = useValidatedState(initIntervals, VALIDATOR.advancedRoundIntervals)
  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATOR.advancedRounds)
  const [audioSound, setAudioSound] = useState(initAudioSound)
  const [audioVolume, setAudioVolume] = useState(initAudioVolume)
  const [skipLastPause, setSkipLastPause] = useState(initSkipLastPause)

  const [isDragging, setIsDragging] = useState(-1)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleIntervalChange = useCallback((newValue: Interval, index: number) => {
    const newIntervals = [...intervals]
    newIntervals[index] = newValue
    setIntervals(newIntervals)
  }, [intervals, setIntervals])

  const handleIntervalDelete = useCallback((index: number) => {
    if (intervals.length > 1) {
      const newIntervals = [...intervals]
      newIntervals.splice(index, 1)
      setIntervals(newIntervals)
    }
  }, [intervals, setIntervals])

  const handleIntervalMove = useCallback((from: number, to: number) => {
    if (from !== to && from !== (to - 1)) {
      const newIntervals = [...intervals]
      newIntervals.splice(from, 1)
      newIntervals.splice((from > to) ? to : (to - 1), 0, intervals[from])
      setIntervals(newIntervals)
    }
  }, [intervals, setIntervals])

  const handleIntervalAdd = useCallback(() => {
    const newIntervals = [
      ...intervals,
      { type: 'work' as IntervalType, name: t.intervalInSeries.type.work, duration: 20 },
    ]
    setIntervals(newIntervals)
  }, [intervals, setIntervals])

  const handleLoadSeries = useCallback(() => {
    dispatch(setModalWindow('LOAD_ADVANCED_SERIES'))
  }, [dispatch])

  const handleSaveSeries = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    dispatch(setModalWindow('SAVE_ADVANCED_SERIES'))
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

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

  // handles change of init values when lastLoadTime has changes
  useEffect(() => {
    setIntervals(initIntervals)
    setRounds(initRounds)
    setAudioSound(initAudioSound)
    setAudioVolume(initAudioVolume)
    setSkipLastPause(initSkipLastPause)
  }, [lastLoadTime])

  return (
    <main className='set-up-interval-timer-advanced'>
      <h1>{t.heading}</h1>

      <h3>{t.intervalInSeriesSubheading}:</h3>

      <ul className='set-up-items'>
        {intervals.map((interval, index) => (
          <li
            key={index}
            className='set-up-item advanced-interval-li'
          >
            <SetUpAdvancedInterval
              index={index}
              interval={interval}
              onChange={(interval) => handleIntervalChange(interval, index)}
              onDelete={() => handleIntervalDelete(index)}
              onMove={handleIntervalMove}
              onDragStart={() => setIsDragging(index)}
              onDragEnd={() => setIsDragging(-1)}
              isDragging={isDragging}
              disabledDelete={intervals.length === 1}
              translation={t.intervalInSeries}
            />
          </li>
        ))}
      </ul>

      <div className='buttons'>
        <Button
          className='add-interval-btn'
          onClick={handleIntervalAdd}
        >
          {t.addIntervalInSeriesBtn}
        </Button>
        <Button
          className='add-interval-btn'
          onClick={handleLoadSeries}
        >
          {t.loadSeries}
        </Button>
        <Button
          className='add-interval-btn'
          onClick={handleSaveSeries}
        >
          {t.saveSeries}
        </Button>
      </div>

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
