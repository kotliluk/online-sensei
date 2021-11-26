// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SetUpReactionsScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { setReactions } from '../../../redux/reactions/actions'
import { useHistory } from 'react-router-dom'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'


export const SetUpReactionsScreen = (): JSX.Element => {
  const [rounds, setRounds] = useState(10)
  const [minSignalDuration, setMinSignalDuration] = useState(200)
  const [minInterval, setMinInterval] = useState(2000)
  const [maxInterval, setMaxInterval] = useState(4000)
  const [color, setColor] = useState('#ff0000')

  const dispatch = useDispatch()
  const history = useHistory()

  const handleMinIntervalChange = useCallback((newValue: number) => {
    newValue <= maxInterval && setMinInterval(newValue)
  }, [maxInterval, setMinInterval])

  const handleMaxIntervalChange = useCallback((newValue: number) => {
    newValue >= minInterval && setMaxInterval(newValue)
  }, [minInterval, setMaxInterval])

  const handleStart = useCallback(() => {
    dispatch(setReactions(rounds, minSignalDuration, minInterval, maxInterval, color))
    history.push('/reactions')
  }, [dispatch, rounds, minSignalDuration, minInterval, maxInterval, color])

  return (
    <main className='set-up-reactions'>
      <h1>Reactions</h1>

      <div className='set-up-items'>
        <div className='set-up-item'>
          <label>Rounds:</label>
          <NumberInput value={rounds} onChange={setRounds} min={1} />
        </div>

        <div className='set-up-item'>
          <label>Signal duration (ms):</label>
          <NumberInput value={minSignalDuration} onChange={setMinSignalDuration} min={10} />
        </div>

        <div className='set-up-item'>
          <label>Minimal interval (ms):</label>
          <NumberInput value={minInterval} onChange={handleMinIntervalChange} min={10} />
        </div>

        <div className='set-up-item'>
          <label>Maximal interval (ms):</label>
          <NumberInput value={maxInterval} onChange={handleMaxIntervalChange} min={10} />
        </div>

        <div className='set-up-item'>
          <label>Signal color:</label>
          <Input type='color' value={color} onChange={setColor} />
        </div>
      </div>

      <Button className='set-up-confirm' onClick={handleStart}>Start</Button>
    </main>
  )
}
