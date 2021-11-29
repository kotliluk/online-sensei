// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SetUpReactionsScreen.scss'
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
  selectReactionsSignalColor,
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


export const SetUpReactionsScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initRounds = useSelector(selectReactionsRounds)
  const initSignalDuration = useSelector(selectReactionsSignalDuration)
  const initMinInterval = useSelector(selectReactionsMinInterval)
  const initMaxInterval = useSelector(selectReactionsMaxInterval)
  const initColor = useSelector(selectReactionsSignalColor)
  const initAudioSound = useSelector(selectReactionsAudioSound)
  const initAudioVolume = useSelector(selectReactionsAudioVolume)

  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATOR.rounds)
  const [signal, setSignal, isValidSignal] = useValidatedState(initSignalDuration, VALIDATOR.signalDuration)
  const [minInterval, setMinInterval, isValidMinInterval] = useValidatedState(initMinInterval, VALIDATOR.minInterval)
  const [maxInterval, setMaxInterval, isValidMaxInterval] = useValidatedState(initMaxInterval, VALIDATOR.maxInterval)
  const [isValidIntervalRange, setIsValidIntervalRange] = useState(initMinInterval <= initMaxInterval)
  const [color, setColor] = useState(initColor)
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
    dispatch(setReactions(rounds, signal, minInterval, maxInterval, color, audioSound, audioVolume))
    history.push('/reactions')
  }, [dispatch, rounds, signal, minInterval, maxInterval, color, audioSound, audioVolume])

  const { reactions: { setUpScreen: t } } = translation

  return (
    <main className='set-up-reactions'>
      <h1>{t.heading}</h1>

      <div className='set-up-items'>
        <div className='set-up-item'>
          <label>{t.rounds.label}:</label>
          <NumberInput
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.rounds.error, LIMITS.rounds.min, LIMITS.rounds.max)}
          />
        </div>

        <div className='set-up-item'>
          <label>{t.signalDuration.label}:</label>
          <NumberInput
            value={signal}
            onChange={setSignal}
            invalid={!isValidSignal}
            errorMessage={insertWords(t.signalDuration.error, LIMITS.signalDuration.min, LIMITS.signalDuration.max)}
          />
        </div>

        <div className='set-up-item'>
          <label>{t.minInterval.label}:</label>
          <NumberInput
            value={minInterval}
            onChange={handleMinIntervalChange}
            invalid={!isValidMinInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.minInterval.error, LIMITS.minInterval.min, LIMITS.minInterval.max), isValidMinInterval],
              [t.minInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </div>

        <div className='set-up-item'>
          <label>{t.maxInterval.label}:</label>
          <NumberInput
            value={maxInterval}
            onChange={handleMaxIntervalChange}
            invalid={!isValidMaxInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.maxInterval.error, LIMITS.maxInterval.min, LIMITS.maxInterval.max), isValidMinInterval],
              [t.maxInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </div>

        <div className='set-up-item'>
          <label>{t.signalColor.label}:</label>
          <Input type='color' value={color} onChange={setColor} />
        </div>

        <div className='set-up-item'>
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
        </div>
      </div>

      <Button
        className='set-up-confirm-btn'
        onClick={handleStart}
        disabled={
          !isValidRounds || !isValidSignal || !isValidMinInterval
          || !isValidMaxInterval || !isValidIntervalRange
        }
      >
        {translation.common.start}
      </Button>
    </main>
  )
}
