// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect, useState } from 'react'
import './SignalBox.scss'
import { useSelector } from '../../../redux/useSelector'
import { getRandomInt } from '../../../utils/random'
import { PausableTimeout } from '../../../logic/pausableTimeout'
import { emptyFunc } from '../../../utils/function'
import { selectTranslation } from '../../../redux/page/selector'


type PlayPhase = 'sleep' | 'waiting' | 'signal'

interface SignalBoxProps {
  paused: boolean
  active: boolean
  onSignal: () => void
  onFinish: () => void
  signalDuration: number
  minInterval: number
  maxInterval: number
  signalColor: string
}

export const SignalBox = (props: SignalBoxProps): JSX.Element | null => {
  const { paused, active, onSignal, onFinish, signalDuration, minInterval, maxInterval, signalColor } = props

  const translation = useSelector(selectTranslation)

  const [phase, setPhase] = useState<PlayPhase>('sleep')
  const [timeoutObj] = useState<PausableTimeout>(new PausableTimeout(emptyFunc, 0))

  useEffect(() => {
    if (phase === 'sleep' && active) {
      setPhase('waiting')
    } else if (phase !== 'sleep' && !active) {
      setPhase('sleep')
    }
  }, [active])

  useEffect(() => {
    if (phase === 'sleep') {
      // SLEEP phase has started
      timeoutObj.pause()
    } else if (phase === 'waiting') {
      // WAITING phase has started
      timeoutObj.restart(() => {
        setPhase('signal')
      }, getRandomInt(minInterval, maxInterval))
    } else if (phase === 'signal') {
      // SIGNAL phase has started
      onSignal()
      timeoutObj.restart(() => {
        setPhase('sleep')
        onFinish()
      }, signalDuration)
    }
  }, [phase])

  return (
    <div className='signal-box' style={phase === 'signal' ? { backgroundColor: signalColor } : {}}>
      {paused && translation.common.paused}
    </div>
  )
}
