import { JSX, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './IntervalTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import {
  selectIntervalTimerAudioSound,
  selectIntervalTimerAudioVolume,
  selectIntervalTimerIntervals,
  selectIntervalTimerIsActual,
} from '../../../redux/intervalTimer/selector'
import { setNotActualIntervalTimer } from '../../../redux/intervalTimer/actions'
import { PausableInterval } from '../../../logic/timing/pausableInterval'
import { useWakeLock } from '../../../logic/hooks/useWakeLock'
import { useLeaveQuestion } from '../../../logic/hooks/useLeaveQuestion'
import { parseMinTime } from '../../../utils/time'
import { playBeep } from '../../../logic/audio/beep'


type PlayPhase = 'init' | 'start' | 'intervals' | 'finished'

export const IntervalTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectIntervalTimerIsActual)
  const intervals = useSelector(selectIntervalTimerIntervals)
  const audioSound = useSelector(selectIntervalTimerAudioSound)
  const audioVolume = useSelector(selectIntervalTimerAudioVolume)

  // remaining time in current interval
  const [currTime, setCurrTime] = useState(intervals[0].duration)
  // total number of rounds (work intervals)
  const [totalRounds] = useState(() => intervals.filter((i) => i.type === 'work').length)
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
  const [clock] = useState<PausableInterval>(() => new PausableInterval(emptyFunc, 0))

  // the phone is put down and the training is watched from a few metres away
  useWakeLock(isActual)
  // nothing here is written down anywhere, so a run in progress is worth a question
  useLeaveQuestion(isActual ? 'SESSION' : null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // handles change of intervals
  useEffect(() => {
    if (phase === 'init' || phase === 'finished') {
      return
    }

    if (currInterval === totalIntervals) {
      playBeep(audioSound, 500, audioVolume)
      clock.pause()
      setPhase('finished')
      return
    }

    // An interval of no length is over the moment it starts, so it is stepped over here.
    // Letting it run would set the countdown to the zero it already holds, the effect
    // below would see no change, and the clock would carry on into negative numbers with
    // the series stuck. A pause of zero is a normal thing to ask for - a workout with no
    // rest - and the set-up screen offers it.
    if (intervals[currInterval].duration <= 0) {
      setCurrentInterval(prev => prev + 1)
      return
    }

    playBeep(audioSound, 500, audioVolume)
    clock.pause()
    if (intervals[currInterval].type === 'work') {
      setCurrRound(prev => prev + 1)
    }
    setCurrTime(intervals[currInterval].duration)
    setCurrentIntervalType(intervals[currInterval].type)
    clock.restart()
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
    // The clock hands over wall time, so a device that was asleep hands over several seconds
    // at once. They stop at the end of the interval rather than carrying into the next one:
    // the effect below moves the series on when the countdown reaches zero, and a countdown
    // allowed past zero never reaches it - the series would hang with the numbers falling.
    clock.restart((elapsedSeconds) => setCurrTime(prev => Math.max(0, prev - elapsedSeconds)), 1000)
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
    if (!isActual) {
      void navigate('/interval-timer/set-up', { replace: true })
    }
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
        {currInterval < totalIntervals && `${t.work}: ${currRound}/${totalRounds}`}
        {currInterval === totalIntervals && `${ct.finished}!`}
      </p>

      {/* the last interval leaves the index one past the end for the render that says
          the series is over, which the line above already accounts for */}
      <h1>{intervals[currInterval]?.name ?? ''}</h1>

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
