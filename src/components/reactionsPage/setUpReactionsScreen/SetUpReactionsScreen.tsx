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
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsRounds,
  selectReactionsSignalColor,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import useValidatedState from '../../../hooks/useValidatedState'
import { INTERVAL_MAX, INTERVAL_MIN, ROUNDS_MAX, ROUNDS_MIN, SIGNAL_MAX, SIGNAL_MIN } from './utils'
import { joinErrorMessages } from '../../../logic/error'


export const SetUpReactionsScreen = (): JSX.Element => {
  const initRounds = useSelector(selectReactionsRounds)
  const initSignalDuration = useSelector(selectReactionsSignalDuration)
  const initMinInterval = useSelector(selectReactionsMinInterval)
  const initMaxInterval = useSelector(selectReactionsMaxInterval)
  const initColor = useSelector(selectReactionsSignalColor)

  const [rounds, setRounds, isValidRounds] = useValidatedState(
    initRounds,
    (value) => value >= ROUNDS_MIN && value <= ROUNDS_MAX,
  )
  const [signalDuration, setSignalDuration, isValidSignalDuration] = useValidatedState(
    initSignalDuration,
    (value) => value >= SIGNAL_MIN && value <= SIGNAL_MAX,
  )
  const [minInterval, setMinInterval, isValidMinInterval] = useValidatedState(
    initMinInterval,
    (value) => value >= INTERVAL_MIN && value <= INTERVAL_MAX,
  )
  const [maxInterval, setMaxInterval, isValidMaxInterval] = useValidatedState(
    initMaxInterval,
    (value) => value >= INTERVAL_MIN && value <= INTERVAL_MAX,
  )
  const [isValidIntervalRange, setIsValidIntervalRange] = useState(initMinInterval <= initMaxInterval)
  const [color, setColor] = useState(initColor)

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

  const handleStart = useCallback(() => {
    dispatch(setReactions(rounds, signalDuration, minInterval, maxInterval, color))
    history.push('/reactions')
  }, [dispatch, rounds, signalDuration, minInterval, maxInterval, color])

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
            errorMessage={`Rounds must be set to between ${ROUNDS_MIN} and ${ROUNDS_MAX}.`}
          />
        </div>

        <div className='set-up-item'>
          <label>Signal duration (ms):</label>
          <NumberInput
            value={signalDuration}
            onChange={setSignalDuration}
            invalid={!isValidSignalDuration}
            errorMessage={`Signal duration must be set between ${SIGNAL_MIN} and ${SIGNAL_MAX} ms.`}
          />
        </div>

        <div className='set-up-item'>
          <label>Minimal interval (ms):</label>
          <NumberInput
            value={minInterval}
            onChange={handleMinIntervalChange}
            invalid={!isValidMinInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [`Minimal interval must be set between ${INTERVAL_MIN} and ${INTERVAL_MAX} ms.`, isValidMinInterval],
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
              [`Maximal interval must be set between ${INTERVAL_MIN} and ${INTERVAL_MAX} ms.`, isValidMaxInterval],
              ['Maximal interval must greater or equal to minimal.', isValidIntervalRange],
            ])}
          />
        </div>

        <div className='set-up-item'>
          <label>Signal color:</label>
          <Input type='color' value={color} onChange={setColor} />
        </div>
      </div>

      <Button
        className='set-up-confirm-btn'
        onClick={handleStart}
        disabled={
          !isValidRounds || !isValidSignalDuration || !isValidMinInterval
          || !isValidMaxInterval || !isValidIntervalRange
        }
      >
        Start
      </Button>
    </main>
  )
}
