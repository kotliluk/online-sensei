// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SetUpReactionsScreen.scss'
import { parseIntOrDefault } from '../../../utils/number'
import { useDispatch } from '../../../redux/useDispatch'
import { setReactions } from '../../../redux/reactions/actions'
import { useHistory } from 'react-router-dom'


export const SetUpReactionsScreen = (): JSX.Element => {
  const [count, setCount] = useState(10)
  const [minSignalDuration, setMinSignalDuration] = useState(200)
  const [maxSignalDuration, setMaxSignalDuration] = useState(200)
  const [minInterval, setMinInterval] = useState(2000)
  const [maxInterval, setMaxInterval] = useState(4000)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleStart = useCallback(() => {
    dispatch(setReactions(count, minSignalDuration, maxSignalDuration, minInterval, maxInterval))
    history.push('/reactions')
  }, [dispatch, count, minSignalDuration, maxSignalDuration, minInterval, maxInterval])

  return (
    <main className='set-up-reactions'>
      <h1>Reactions</h1>

      <label>Count:</label>
      <input
        type='number' value={count} min='1'
        onChange={e => setCount(parseIntOrDefault(e.target.value, count))}
      />

      <label>Minimal signal duration (milliseconds):</label>
      <input
        type='number' value={minSignalDuration} min='10'
        onChange={e => setMinSignalDuration(parseIntOrDefault(e.target.value, count))}
      />

      <label>Maximal signal duration (milliseconds):</label>
      <input
        type='number' value={maxSignalDuration} min='10'
        onChange={e => setMaxSignalDuration(parseIntOrDefault(e.target.value, count))}
      />

      <label>Minimal interval (milliseconds):</label>
      <input
        type='number' value={minInterval} min='10'
        onChange={e => setMinInterval(parseIntOrDefault(e.target.value, count))}
      />

      <label>Maximal interval (milliseconds):</label>
      <input
        type='number' value={maxInterval} min='10'
        onChange={e => setMaxInterval(parseIntOrDefault(e.target.value, count))}
      />

      <button onClick={handleStart}>Start</button>
    </main>
  )
}
