// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import './ReactionsSetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { setReactions } from '../../../redux/reactions/actions'
import { useHistory } from 'react-router-dom'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsAudioSound,
  selectReactionsAudioVolume,
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsRounds,
  selectReactionsSignalColors, selectReactionsSignalCount,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { joinErrorMessages } from '../../../utils/error'
import { Select } from '../../atoms/select/Select'
import { BEEP_A, BeepType, getBeepName, NO_BEEP } from '../../../types/beepType'
import { LIMITS, VALIDATOR } from '../../../redux/reactions/utils'
import { preloadBeep } from '../../../logic/audio/beep'
import { VolumeInput } from '../../atoms/input/VolumeInput'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import { CounterInput } from '../../atoms/input/CounterInput'


export const ReactionsSetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initRounds = useSelector(selectReactionsRounds)
  const initSignalDuration = useSelector(selectReactionsSignalDuration)
  const initMinInterval = useSelector(selectReactionsMinInterval)
  const initMaxInterval = useSelector(selectReactionsMaxInterval)
  const initSignalCount = useSelector(selectReactionsSignalCount)
  const initSignalColors = useSelector(selectReactionsSignalColors)
  const initAudioSound = useSelector(selectReactionsAudioSound)
  const initAudioVolume = useSelector(selectReactionsAudioVolume)

  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATOR.rounds)
  const [signal, setSignal, isValidSignal] = useValidatedState(initSignalDuration, VALIDATOR.signalDuration)
  const [minInterval, setMinInterval, isValidMinInterval] = useValidatedState(initMinInterval, VALIDATOR.minInterval)
  const [maxInterval, setMaxInterval, isValidMaxInterval] = useValidatedState(initMaxInterval, VALIDATOR.maxInterval)
  const [isValidIntervalRange, setIsValidIntervalRange] = useState(initMinInterval <= initMaxInterval)
  const [signalCount, setSignalCount] = useState(initSignalCount)
  const [signalColors, setSignalColors] = useState(initSignalColors)
  const [audioSound, setAudioSound] = useState(initAudioSound)
  const [audioVolume, setAudioVolume] = useState(initAudioVolume)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleMinIntervalChange = useCallback((newValue: number) => {
    setMinInterval(newValue)
    setIsValidIntervalRange(newValue <= maxInterval)
  }, [maxInterval, setMinInterval, setIsValidIntervalRange])

  const handleMaxIntervalChange = useCallback((newValue: number) => {
    setMaxInterval(newValue)
    setIsValidIntervalRange(newValue >= minInterval)
  }, [minInterval, setMaxInterval, setIsValidIntervalRange])

  const handleSignalColorChange = useCallback((newValue: string, index: number) => {
    setSignalColors(prevColors => {
      const newColors = [...prevColors]
      newColors[index] = newValue
      return newColors
    })
  }, [setSignalColors])

  const handleAudioChange = useCallback((newValue: string) => {
    preloadBeep(newValue as BeepType)
    setAudioSound(newValue as BeepType)
  }, [setAudioSound])

  // TODO - Fix
  // const handleTryAudio = useCallback(() => {
  //   console.log(audioSound, 300, audioVolume)
  //   playBeep(audioSound, 300, audioVolume)
  // }, [audioSound, audioVolume])

  const handleStart = useCallback(() => {
    dispatch(setReactions(rounds, signal, minInterval, maxInterval, signalCount, signalColors, audioSound, audioVolume))
    history.push('/reactions')
  }, [dispatch, rounds, signal, minInterval, maxInterval, signalCount, signalColors, audioSound, audioVolume])

  const handleBack = useCallback(() => {
    history.push('/')
  }, [dispatch])

  useEffect(() => {
    preloadBeep(initAudioSound)
  }, [])

  const { reactions: { setUpScreen: t } } = translation

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
            errorMessage={insertWords(t.rounds.error, LIMITS.rounds.min, LIMITS.rounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.signalDuration.label}:</label>
          <NumberInput
            className='set-up-input'
            value={signal}
            onChange={setSignal}
            invalid={!isValidSignal}
            errorMessage={insertWords(t.signalDuration.error, LIMITS.signalDuration.min, LIMITS.signalDuration.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.minInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={minInterval}
            onChange={handleMinIntervalChange}
            invalid={!isValidMinInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.minInterval.error, LIMITS.minInterval.min, LIMITS.minInterval.max), isValidMinInterval],
              [t.minInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.maxInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={maxInterval}
            onChange={handleMaxIntervalChange}
            invalid={!isValidMaxInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.maxInterval.error, LIMITS.maxInterval.min, LIMITS.maxInterval.max), isValidMaxInterval],
              [t.maxInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.signalCount.label}:</label>
          <CounterInput
            minusBtnClassName='set-up-signal-count-cnt-btn'
            plusBtnClassName='set-up-signal-count-cnt-btn'
            value={signalCount}
            onChange={setSignalCount}
            min={LIMITS.signalCount.min}
            max={LIMITS.signalCount.max}
          />
        </li>

        {signalColors.slice(0, signalCount).map((color, i) => (
          <li key={i} className='set-up-item'>
            <label>{`${t.signalColor.label} ${i + 1}:`}</label>
            <Input
              type='color'
              className='set-up-input'
              value={color}
              onChange={color => handleSignalColorChange(color, i)}
            />
          </li>
        ))}

        <li className='set-up-item'>
          <label>{t.sound.label}:</label>
          <div className='set-up-volume'>
            <Select
              className='set-up-volume-select'
              selected={audioSound}
              values={[
                { value: NO_BEEP, text: t.sound.noAudio },
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
      </ul>

      <div className='buttons'>
        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={
            !isValidRounds || !isValidSignal || !isValidMinInterval
            || !isValidMaxInterval || !isValidIntervalRange
          }
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
