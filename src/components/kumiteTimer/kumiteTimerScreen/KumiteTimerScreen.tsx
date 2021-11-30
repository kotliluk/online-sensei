// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './KumiteTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { PausableTimeout } from '../../../logic/timing/pausableTimeout'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import { selectKumiteTimerDuration, selectKumiteTimerIsActual } from '../../../redux/kumiteTimer/selector'
import { setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'


type PlayPhase = 'init' | 'fight' | 'finished'

export const KumiteTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectKumiteTimerIsActual)
  const duration = useSelector(selectKumiteTimerDuration)

  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(false)
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
    setSeconds(0)
  }, [isPaused, setIsPaused, setSeconds])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setNotActualKumiteTimer())
      timeoutObj.pause()
    }
  }, [])

  useEffect(() => {
    // if (phase === 'init' || phase === 'waiting') {
    //   // WAITING phase has started
    //   if (round === rounds) {
    //     setPhase('finished')
    //   } else {
    //     timeoutObj.restart(() => {
    //       setCurSignal(getRandomInt(0, signalCount))
    //       setPhase('signal')
    //     }, getRandomInt(minInterval, maxInterval))
    //   }
    // } else if (phase === 'signal') {
    //   // SIGNAL phase has started
    //   playBeep(audioSound, signalDuration, audioVolume)
    //   timeoutObj.restart(() => {
    //     setRound(prev => prev + 1)
    //     setPhase('waiting')
    //   }, signalDuration)
    // }
  }, [phase])

  useEffect(() => {
    !isActual && history.push('/kumite-timer/set-up')
  }, [isActual])

  if (!isActual) {
    return null
  }

  const { reactions: { playScreen: t }, common: ct } = translation

  return (
    <main className='kumite-timer'>
      <h1>Kumite timer</h1>
      <Button className='orange' onClick={handleGoBack}>{ct.back}</Button>
    </main>
  )
}
