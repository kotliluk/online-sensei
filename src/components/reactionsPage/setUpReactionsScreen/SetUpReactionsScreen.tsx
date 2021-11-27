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
import { joinErrorMessages } from '../../../utils/error'
import { LIMITS, VALIDATORS } from '../../../redux/reactions/state'


export const SetUpReactionsScreen = (): JSX.Element => {
  const initRounds = useSelector(selectReactionsRounds)
  const initSignalDuration = useSelector(selectReactionsSignalDuration)
  const initMinInterval = useSelector(selectReactionsMinInterval)
  const initMaxInterval = useSelector(selectReactionsMaxInterval)
  const initColor = useSelector(selectReactionsSignalColor)

  const [rounds, setRounds, isValidRounds] = useValidatedState(initRounds, VALIDATORS.ROUNDS)
  const [signal, setSignal, isValidSignal] = useValidatedState(initSignalDuration, VALIDATORS.SIGNAL)
  const [minInterval, setMinInterval, isValidMinInterval] = useValidatedState(initMinInterval, VALIDATORS.INTERVAL)
  const [maxInterval, setMaxInterval, isValidMaxInterval] = useValidatedState(initMaxInterval, VALIDATORS.INTERVAL)
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
    dispatch(setReactions(rounds, signal, minInterval, maxInterval, color))
    history.push('/reactions')
  }, [dispatch, rounds, signal, minInterval, maxInterval, color])

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
            errorMessage={`Rounds must be set to between ${LIMITS.ROUNDS.MIN} and ${LIMITS.ROUNDS.MAX}.`}
          />
        </div>

        <div className='set-up-item'>
          <label>Signal duration (ms):</label>
          <NumberInput
            value={signal}
            onChange={setSignal}
            invalid={!isValidSignal}
            errorMessage={`Signal duration must be set between ${LIMITS.SIGNAL.MIN} and ${LIMITS.SIGNAL.MAX} ms.`}
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
                `Minimal interval must be set between ${LIMITS.INTERVAL.MIN} and ${LIMITS.INTERVAL.MAX} ms.`,
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
                `Maximal interval must be set between ${LIMITS.INTERVAL.MIN} and ${LIMITS.INTERVAL.MAX} ms.`,
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
