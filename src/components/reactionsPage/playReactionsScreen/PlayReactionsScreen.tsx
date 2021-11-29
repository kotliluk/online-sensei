// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './PlayReactionsScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsAudioSound,
  selectReactionsAudioVolume,
  selectReactionsIsActual,
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsRounds,
  selectReactionsSignalColor,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setNotActualReactions } from '../../../redux/reactions/actions'
import { getRandomInt } from '../../../utils/random'
import { PausableTimeout } from '../../../logic/pausableTimeout'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { playBeep } from '../../../logic/audio/beep'


type PlayPhase = 'init' | 'signal' | 'waiting' | 'finished'
type TimeoutState = 'running' | 'paused'

export const PlayReactionsScreen = (): JSX.Element | null => {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [timeoutState, setTimeoutState] = useState<TimeoutState>('running')
  const [timeoutObj] = useState<PausableTimeout>(new PausableTimeout(emptyFunc, 0))

  const isActual = useSelector(selectReactionsIsActual)
  const rounds = useSelector(selectReactionsRounds)
  const signalDuration = useSelector(selectReactionsSignalDuration)
  const minInterval = useSelector(selectReactionsMinInterval)
  const maxInterval = useSelector(selectReactionsMaxInterval)
  const signalColor = useSelector(selectReactionsSignalColor)
  const audioSound = useSelector(selectReactionsAudioSound)
  const audioVolume = useSelector(selectReactionsAudioVolume)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleTimeoutStateChange = useCallback(() => {
    if (phase === 'finished') {
      return
    }

    if (timeoutState === 'running') {
      setTimeoutState('paused')
      timeoutObj.pause()
    } else {
      setTimeoutState('running')
      timeoutObj.resume()
    }
  }, [phase, timeoutState, setTimeoutState, timeoutObj])

  const handleTimeoutReset = useCallback(() => {
    setPhase('init')
    setTimeoutState('running')
    setRound(0)
  }, [timeoutState, setTimeoutState, setRound])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualReactions())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setNotActualReactions())
      timeoutObj.pause()
    }
  }, [])

  useEffect(() => {
    if (phase === 'init' || phase === 'waiting') {
      // WAITING phase has started
      if (round === rounds) {
        setPhase('finished')
      } else {
        timeoutObj.restart(() => {
          setPhase('signal')
        }, getRandomInt(minInterval, maxInterval))
      }
    } else if (phase === 'signal') {
      // SIGNAL phase has started
      playBeep(audioSound, signalDuration, audioVolume)
      timeoutObj.restart(() => {
        setRound(prev => prev + 1)
        setPhase('waiting')
      }, signalDuration)
    }
  }, [phase])

  useEffect(() => {
    !isActual && history.push('/reactions/set-up')
  }, [isActual])

  if (!isActual) {
    return null
  }

  return (
    <main className='play-reactions'>
      <h1>Reactions</h1>
      <p>
        {round < rounds && `Round: ${round + 1}/${rounds}`}
        {round === rounds && 'Finished!'}
      </p>

      <div className='signal-box' style={phase === 'signal' ? { backgroundColor: signalColor } : {}}>
        {timeoutState === 'paused' && 'PAUSED'}
      </div>

      <div className='buttons'>
        <Button
          className={timeoutState === 'running' ? 'orange' : 'green'}
          onClick={handleTimeoutStateChange}
          disabled={phase === 'finished'}
        >
          {timeoutState === 'running' ? 'Pause' : 'Resume'}
        </Button>
        <Button className='orange' onClick={handleTimeoutReset}>Reset</Button>
        <Button className='orange' onClick={handleGoBack}>Back</Button>
      </div>
    </main>
  )
}
