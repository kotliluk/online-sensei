// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './PlayReactionsScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsActual,
  selectReactionsCount,
  selectReactionsMaxInterval, selectReactionsMaxSignalDuration,
  selectReactionsMinInterval, selectReactionsMinSignalDuration,
} from '../../../redux/reactions/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { resetReactions } from '../../../redux/reactions/actions'
import { getRandomInt } from '../../../utils/random'


type PlayPhase = 'signal' | 'waiting' | 'finished'

export const PlayReactionsScreen = (): JSX.Element | null => {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('waiting')
  // TODO - pause wrapper
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const actual = useSelector(selectReactionsActual)
  const count = useSelector(selectReactionsCount)
  const minSignalDuration = useSelector(selectReactionsMinSignalDuration)
  const maxSignalDuration = useSelector(selectReactionsMaxSignalDuration)
  const minInterval = useSelector(selectReactionsMinInterval)
  const maxInterval = useSelector(selectReactionsMaxInterval)
  // TODO - audio settings
  // TODO - color settings

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    return () => dispatch(resetReactions()) as unknown as void
  }, [])

  useEffect(() => {
    if (phase === 'waiting') {
      // WAITING phase has started
      timeoutId && clearTimeout(timeoutId)

      if (round === count) {
        setPhase('finished')
      } else {
        setTimeoutId(setTimeout(() => {
          setRound(prev => prev + 1)
          setPhase('signal')
        }, getRandomInt(minInterval, maxInterval)))
      }
    } else if (phase === 'signal') {
      // SIGNAL phase has started
      timeoutId && clearTimeout(timeoutId)

      setTimeoutId(setTimeout(() => {
        setPhase('waiting')
      }, getRandomInt(minSignalDuration, maxSignalDuration)))
    }
  }, [phase])

  if (!actual) {
    history.push('/reactions/set-up')
    return null
  }

  return (
    <main className='play-reactions'>
      <h1>Reactions</h1>
      <p>Round: {round + 1}/{count}</p>
      <p>Phase: {phase}</p>
      <div className={`signal-box ${phase}`} />
    </main>
  )
}
