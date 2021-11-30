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
  selectReactionsSignalColors, selectReactionsSignalCount,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setNotActualReactions } from '../../../redux/reactions/actions'
import { getRandomInt } from '../../../utils/random'
import { PausableTimeout } from '../../../logic/pausableTimeout'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { playBeep } from '../../../logic/audio/beep'
import { selectTranslation } from '../../../redux/page/selector'


type PlayPhase = 'init' | 'signal' | 'waiting' | 'finished'

export const PlayReactionsScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectReactionsIsActual)
  const rounds = useSelector(selectReactionsRounds)
  const signalDuration = useSelector(selectReactionsSignalDuration)
  const minInterval = useSelector(selectReactionsMinInterval)
  const maxInterval = useSelector(selectReactionsMaxInterval)
  const signalCount = useSelector(selectReactionsSignalCount)
  const signalColors = useSelector(selectReactionsSignalColors)
  const audioSound = useSelector(selectReactionsAudioSound)
  const audioVolume = useSelector(selectReactionsAudioVolume)

  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(false)
  const [curSignal, setCurSignal] = useState(0)
  const [timeoutObj] = useState<PausableTimeout>(new PausableTimeout(emptyFunc, 0))

  const dispatch = useDispatch()
  const history = useHistory()

  const handleTimeoutStateChange = useCallback(() => {
    if (phase === 'finished') {
      return
    }

    if (isPaused) {
      setIsPaused(false)
      timeoutObj.resume()
    } else {
      setIsPaused(true)
      timeoutObj.pause()
    }
  }, [phase, isPaused, setIsPaused, timeoutObj])

  const handleTimeoutReset = useCallback(() => {
    setPhase('init')
    setIsPaused(false)
    setRound(0)
  }, [isPaused, setIsPaused, setRound])

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
          setCurSignal(getRandomInt(0, signalCount))
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

  const { reactions: { playScreen: t }, common: ct } = translation

  return (
    <main className='play-reactions'>
      <h1>{t.heading}</h1>
      <p>
        {round < rounds && `${t.round}: ${round + 1}/${rounds}`}
        {round === rounds && `${ct.finished}!`}
      </p>

      <div className={`signal-boxes boxes-${signalCount}`}>
        {signalColors.slice(0, signalCount).map((color, i) => (
          <div
            key={i}
            className='signal-box'
            style={(phase === 'signal' && curSignal === i) ? { backgroundColor: color } : {}}
          >
            {isPaused && ct.paused}
          </div>
        ))}
      </div>

      <div className='buttons'>
        <Button
          className={isPaused ? 'green' : 'orange'}
          onClick={handleTimeoutStateChange}
          disabled={phase === 'finished'}
        >
          {isPaused ? ct.resume : ct.pause}
        </Button>
        <Button className='orange' onClick={handleTimeoutReset}>{ct.reset}</Button>
        <Button className='orange' onClick={handleGoBack}>{ct.back}</Button>
      </div>
    </main>
  )
}
