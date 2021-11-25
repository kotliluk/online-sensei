// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './PlayReactionsScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsIsActual,
  selectReactionsRounds,
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsMaxSignalDuration,
  selectReactionsMinSignalDuration,
  selectReactionsSignalColor,
} from '../../../redux/reactions/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { resetReactions } from '../../../redux/reactions/actions'
import { getRandomInt } from '../../../utils/random'
import { PausableTimeout } from '../../../logic/pausableTimeout'
import { emptyFunc } from '../../../utils/function'


type PlayPhase = 'signal' | 'waiting' | 'finished'
type TimeoutState = 'running' | 'paused'

export const PlayReactionsScreen = (): JSX.Element | null => {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('waiting')
  const [timeoutState, setTimeoutState] = useState<TimeoutState>('running')
  const [timeoutObj] = useState<PausableTimeout>(new PausableTimeout(emptyFunc, 0))

  const isActual = useSelector(selectReactionsIsActual)
  const rounds = useSelector(selectReactionsRounds)
  const minSignalDuration = useSelector(selectReactionsMinSignalDuration)
  const maxSignalDuration = useSelector(selectReactionsMaxSignalDuration)
  const minInterval = useSelector(selectReactionsMinInterval)
  const maxInterval = useSelector(selectReactionsMaxInterval)
  const signalColor = useSelector(selectReactionsSignalColor)
  // TODO - audio settings

  const dispatch = useDispatch()
  const history = useHistory()

  const handleTimeoutStateChange = useCallback(() => {
    if (timeoutState === 'running') {
      setTimeoutState('paused')
      timeoutObj.pause()
    } else {
      setTimeoutState('running')
      timeoutObj.resume()
    }
  }, [timeoutState, setTimeoutState, timeoutObj])

  useEffect(() => {
    return () => {
      dispatch(resetReactions())
      timeoutObj.pause()
    }
  }, [])

  useEffect(() => {
    if (phase === 'waiting') {
      // WAITING phase has started
      if (round === rounds) {
        setPhase('finished')
      } else {
        timeoutObj.restart(() => {
          setRound(prev => prev + 1)
          setPhase('signal')
        }, getRandomInt(minInterval, maxInterval))
      }
    } else if (phase === 'signal') {
      // SIGNAL phase has started
      timeoutObj.restart(() => {
        setPhase('waiting')
      }, getRandomInt(minSignalDuration, maxSignalDuration))
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
      <p>Round: {round + 1}/{rounds}</p>
      <div className='signal-box' style={phase === 'signal' ? { backgroundColor: signalColor } : {}} />
      <button onClick={handleTimeoutStateChange}>{timeoutState === 'running' ? 'Pause' : 'Resume'}</button>
    </main>
  )
}
