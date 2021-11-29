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
import useValidatedState from '../../../hooks/useValidatedState'
import { joinErrorMessages } from '../../../utils/error'
import { Select } from '../../atoms/select/Select'
import { BEEP_A, BeepType, NO_BEEP } from '../../../types/beepType'
import { LIMITS, VALIDATOR } from '../../../redux/reactions/utils'
import { preloadBeep } from '../../../logic/audio/beep'
import { VolumeInput } from '../../atoms/input/VolumeInput'


export const SetUpReactionsScreen = (): JSX.Element => {
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

  return (
    <main className='set-up-reactions'>
      <h1>Reactions</h1>

      <div className='set-up-items'>
        <div className='set-up-item'>
          <label>Rounds:</label>
          <NumberInput
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={`Rounds must be set to between ${LIMITS.rounds.min} and ${LIMITS.rounds.max}.`}
          />
        </div>

        <div className='set-up-item'>
          <label>Signal duration (ms):</label>
          <NumberInput
            value={signal}
            onChange={setSignal}
            invalid={!isValidSignal}
            errorMessage={
              `Signal duration must be set between ${LIMITS.signalDuration.min} and ${LIMITS.signalDuration.max} ms.`
            }
          />
        </div>

        <div className='set-up-item'>
          <label>Minimal interval (ms):</label>
          <NumberInput
            value={minInterval}
            onChange={handleMinIntervalChange}
            invalid={!isValidMinInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [
                `Minimal interval must be set between ${LIMITS.minInterval.min} and ${LIMITS.minInterval.max} ms.`,
                isValidMinInterval,
              ],
              ['Minimal interval must less or equal to maximal.', isValidIntervalRange],
            ])}
          />
        </div>

        <div className='set-up-item'>
          <label>Maximal interval (ms):</label>
          <NumberInput
            value={maxInterval}
            onChange={handleMaxIntervalChange}
            invalid={!isValidMaxInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [
                `Maximal interval must be set between ${LIMITS.maxInterval.min} and ${LIMITS.maxInterval.max} ms.`,
                isValidMaxInterval,
              ],
              ['Maximal interval must greater or equal to minimal.', isValidIntervalRange],
            ])}
          />
        </div>

        <div className='set-up-item'>
          <label>Signal color:</label>
          <Input type='color' value={color} onChange={setColor} />
        </div>

        <div className='set-up-item'>
          <label>Sound:</label>
          <div className='set-up-volume'>
            <Select
              className='set-up-volume-select'
              selected={audioSound}
              values={[
                // TODO - names from language
                { value: NO_BEEP, text: 'No audio' },
                { value: BEEP_A, text: 'Beep 1' },
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
        Start
      </Button>
    </main>
  )
}
