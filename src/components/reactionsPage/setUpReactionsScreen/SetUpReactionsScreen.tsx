// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SetUpReactionsScreen.scss'
import { parseIntOrDefault } from '../../../utils/number'
import { useDispatch } from '../../../redux/useDispatch'
import { setReactions } from '../../../redux/reactions/actions'
import { useHistory } from 'react-router-dom'


export const SetUpReactionsScreen = (): JSX.Element => {
  const [rounds, setRounds] = useState(10)
  const [minSignalDuration, setMinSignalDuration] = useState(200)
  const [maxSignalDuration, setMaxSignalDuration] = useState(200)
  const [minInterval, setMinInterval] = useState(2000)
  const [maxInterval, setMaxInterval] = useState(4000)
  const [color, setColor] = useState('#ff0000')

  const dispatch = useDispatch()
  const history = useHistory()

  const handleMinSignalDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseIntOrDefault(e.target.value, minSignalDuration)
    newValue <= maxSignalDuration && setMinSignalDuration(newValue)
  }, [minSignalDuration, maxSignalDuration, setMinSignalDuration])

  const handleMaxSignalDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseIntOrDefault(e.target.value, maxSignalDuration)
    newValue >= minSignalDuration && setMaxSignalDuration(newValue)
  }, [minSignalDuration, maxSignalDuration, setMaxSignalDuration])

  const handleMinIntervalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseIntOrDefault(e.target.value, minInterval)
    newValue <= maxInterval && setMinInterval(newValue)
  }, [minInterval, maxInterval, setMinInterval])

  const handleMaxIntervalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseIntOrDefault(e.target.value, maxInterval)
    newValue >= minInterval && setMaxInterval(newValue)
  }, [minInterval, maxInterval, setMaxInterval])

  const handleStart = useCallback(() => {
    dispatch(setReactions(rounds, minSignalDuration, maxSignalDuration, minInterval, maxInterval, color))
    history.push('/reactions')
  }, [dispatch, rounds, minSignalDuration, maxSignalDuration, minInterval, maxInterval, color])

  return (
    <main className='set-up-reactions'>
      <h1>Reactions</h1>

      <label>Rounds:</label>
      <input
        type='number' value={rounds} min='1'
        onChange={e => setRounds(parseIntOrDefault(e.target.value, rounds))}
      />

      <label>Minimal signal duration (milliseconds):</label>
      <input
        type='number' value={minSignalDuration} min='10'
        onChange={handleMinSignalDurationChange}
      />

      <label>Maximal signal duration (milliseconds):</label>
      <input
        type='number' value={maxSignalDuration} min='10'
        onChange={handleMaxSignalDurationChange}
      />

      <label>Minimal interval (milliseconds):</label>
      <input
        type='number' value={minInterval} min='10'
        onChange={handleMinIntervalChange}
      />

      <label>Maximal interval (milliseconds):</label>
      <input
        type='number' value={maxInterval} min='10'
        onChange={handleMaxIntervalChange}
      />

      <label>Signal color:</label>
      <input
        type='color' value={color} min='10'
        onChange={e => setColor(e.target.value)}
      />

      <button onClick={handleStart}>Start</button>
    </main>
  )
}
