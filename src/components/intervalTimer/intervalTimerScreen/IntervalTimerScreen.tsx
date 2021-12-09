// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './IntervalTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import { selectIntervalTimerIntervals, selectIntervalTimerIsActual } from '../../../redux/intervalTimer/selector'
import { setNotActualIntervalTimer } from '../../../redux/intervalTimer/actions'
import { PausableInterval } from '../../../logic/timing/pausableInterval'
import { parseMinTime } from '../../../utils/time'


type PlayPhase = 'init' | 'start' | 'intervals' | 'finished'

export const IntervalTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectIntervalTimerIsActual)
  const intervals = useSelector(selectIntervalTimerIntervals)

  // remaining time in current interval
  const [currTime, setCurrTime] = useState(intervals[0].duration)
  // total number of rounds (work intervals)
  const [totalRounds] = useState(intervals.filter((i) => i.type === 'work').length)
  // actual round (number of previous work intervals)
  const [currRound, setCurrRound] = useState(intervals[0].type === 'work' ? 1 : 0)
  // total number of intervals
  const [totalIntervals] = useState(intervals.length)
  // index of the current interval
  const [currInterval, setCurrentInterval] = useState(0)
  // type of the current interval
  const [currIntervalType, setCurrentIntervalType] = useState(intervals[0].type)

  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(false)
  const [clock] = useState<PausableInterval>(new PausableInterval(emptyFunc, 0))

  const dispatch = useDispatch()
  const history = useHistory()

  // handles change of intervals
  useEffect(() => {
    if (phase === 'init' || phase === 'finished') {
      return
    }

    clock.pause()
    if (currInterval === totalIntervals) {
      setPhase('finished')
    } else {
      if (intervals[currInterval].type === 'work') {
        setCurrRound(prev => prev + 1)
      }
      setCurrTime(intervals[currInterval].duration)
      setCurrentIntervalType(intervals[currInterval].type)
      clock.restart()
    }
  }, [currInterval])

  // handles change of seconds
  useEffect(() => {
    if (phase === 'init' || phase === 'finished') {
      return
    }

    if (currTime === 0) {
      setCurrentInterval(prev => prev + 1)
      clock.pause()
    }
  }, [currTime])

  const handleTogglePause = useCallback(() => {
    if (phase === 'finished') {
      return
    }

    if (isPaused) {
      setIsPaused(false)
      clock.resume()
    } else {
      setIsPaused(true)
      clock.pause()
    }
  }, [phase, isPaused, setIsPaused, clock])

  const handleStart = useCallback(() => {
    setPhase('intervals')
    setIsPaused(false)
    clock.restart(() => setCurrTime(prev => prev - 1), 1000)
  }, [isPaused, setIsPaused, setCurrTime])

  const handleReset = useCallback(() => {
    setPhase('init')
    setIsPaused(true)
    setCurrTime(intervals[0].duration)
    setCurrentInterval(0)
    setCurrentIntervalType(intervals[0].type)
    setCurrRound(intervals[0].type === 'work' ? 1 : 0)
  }, [isPaused, setIsPaused, setCurrRound])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualIntervalTimer())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setNotActualIntervalTimer())
      clock.pause()
    }
  }, [])

  useEffect(() => {
    !isActual && history.push('/interval-timer/set-up')
  }, [isActual])

  if (!isActual) {
    return null
  }

  const { intervalTimer: { playScreen: t }, common: ct } = translation

  const inProgress = phase === 'intervals' || phase === 'start'

  return (
    <main className='play-reactions'>
      <h1>{t.heading}</h1>
      <p>
        {currInterval < totalIntervals && `${t.round}: ${currRound}/${totalRounds}`}
        {currInterval === totalIntervals && `${ct.finished}!`}
      </p>

      <span className={`time ${currIntervalType}`}>{parseMinTime(currTime)}</span>

      <div className='buttons'>
        <Button
          className={isPaused ? 'green' : 'orange'}
          onClick={handleTogglePause}
          disabled={!inProgress}
        >
          {isPaused ? ct.resume : ct.pause}
        </Button>
        <Button
          className={phase === 'init' ? 'green' : 'orange'}
          onClick={phase === 'init' ? handleStart : handleReset}
          disabled={inProgress && !isPaused}
        >
          {phase === 'init' ? ct.start : ct.reset}
        </Button>
        <Button
          className='orange'
          onClick={handleGoBack}
          disabled={inProgress && !isPaused}
        >
          {ct.back}
        </Button>
      </div>
    </main>
  )
}
