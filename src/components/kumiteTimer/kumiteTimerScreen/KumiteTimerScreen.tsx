// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './KumiteTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { PausableInterval } from '../../../logic/timing/pausableInterval'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import {
  selectKumiteTimerAtoshibaraku,
  selectKumiteTimerDuration,
  selectKumiteTimerIsActual,
} from '../../../redux/kumiteTimer/selector'
import { setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'
import { FighterStats } from '../fighterStats/FighterStats'
import useControlledState from '../../../logic/hooks/useControledState'
import { Senchu } from '../utils'
import { FightStats } from '../fightStats/FightStats'
import { LIMITS } from '../../../redux/kumiteTimer/utils'
import { playAtoshibaraku, playSignalEnd, preloadKumiteAudio } from '../../../logic/audio/kumite'


type PlayPhase = 'init' | 'fight' | 'finished'

export const KumiteTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectKumiteTimerIsActual)
  const duration = useSelector(selectKumiteTimerDuration)
  const atoshibaraku = useSelector(selectKumiteTimerAtoshibaraku)

  const [time, setTime] = useState(duration)
  const [scoreRed, setScoreRed] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsOneRed, setFoulsOneRed] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [foulsTwoRed, setFoulsTwoRed] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [scoreBlue, setScoreBlue] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsOneBlue, setFoulsOneBlue] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [foulsTwoBlue, setFoulsTwoBlue] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [senchu, setSenchu] = useState<Senchu>('NONE')

  // TODO - switch sides
  // TODO - open in new mirror window

  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(true)
  const [timeoutObj] = useState<PausableInterval>(new PausableInterval(emptyFunc, 0))

  const dispatch = useDispatch()
  const history = useHistory()

  const handleManualTimeChange = useCallback((newTime: number) => {
    if (newTime >= 0 && newTime <= LIMITS.duration.max) {
      setTime(newTime)
    }
  }, [setTime])

  const handleSenchuChange = useCallback((senchu: Senchu) => {
    setSenchu(prev => prev === senchu ? 'NONE' : senchu)
  }, [setSenchu])

  const handleTogglePause = useCallback(() => {
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

  const handleStart = useCallback(() => {
    setPhase('fight')
    setIsPaused(false)
    timeoutObj.restart(() => {
      setTime(prev => prev - 1)
    }, 1000)
  }, [isPaused, setIsPaused, setTime])

  const handleReset = useCallback(() => {
    setPhase('init')
    setIsPaused(true)
    setTime(duration)
    setScoreRed(0)
    setFoulsOneRed(0)
    setFoulsTwoRed(0)
    setScoreBlue(0)
    setFoulsOneBlue(0)
    setFoulsTwoBlue(0)
    setSenchu('NONE')
    timeoutObj.pause()
  }, [isPaused, setIsPaused, setTime])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
  }, [dispatch])

  useEffect(() => {
    preloadKumiteAudio()
    return () => {
      dispatch(setNotActualKumiteTimer())
      timeoutObj.pause()
    }
  }, [])

  useEffect(() => {
    if (time === 0) {
      playSignalEnd()
      setPhase('finished')
      timeoutObj.pause()
    } else if (time === atoshibaraku) {
      playAtoshibaraku()
    }
  }, [time, atoshibaraku])

  useEffect(() => {
    !isActual && history.push('/kumite-timer/set-up')
  }, [isActual])

  const renderRedData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={true}
      score={scoreRed}
      foulsOne={foulsOneRed}
      foulsTwo={foulsTwoRed}
      onScoreChange={setScoreRed}
      onFoulsOneChange={setFoulsOneRed}
      onFoulsTwoChange={setFoulsTwoRed}
    />
  ), [scoreRed, foulsOneRed, foulsTwoRed])

  const renderBlueData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={false}
      score={scoreBlue}
      foulsOne={foulsOneBlue}
      foulsTwo={foulsTwoBlue}
      onScoreChange={setScoreBlue}
      onFoulsOneChange={setFoulsOneBlue}
      onFoulsTwoChange={setFoulsTwoBlue}
    />
  ), [scoreBlue, foulsOneBlue, foulsTwoBlue])

  if (!isActual) {
    return null
  }

  const { kumiteTimer: { playScreen: t }, common: ct } = translation

  const dangerousButtonsDisabled = phase === 'fight' && !isPaused

  return (
    <main className='kumite-timer'>
      <h1>{t.heading}</h1>

      <div className='timer'>
        {renderRedData('left-fighter')}
        <FightStats
          className='fight-stats'
          time={time}
          senchu={senchu}
          timeButtonsDisabled={dangerousButtonsDisabled}
          onTimeReset={() => setTime(duration)}
          onTimeChange={handleManualTimeChange}
          onSenchuChange={handleSenchuChange}
        />
        {renderBlueData('right-fighter')}
      </div>

      <div className='buttons'>
        <Button
          className={isPaused ? 'green' : 'orange'}
          onClick={handleTogglePause}
          disabled={phase === 'init' || phase === 'finished'}
        >
          {isPaused ? ct.resume : ct.pause}
        </Button>
        <Button
          className={phase === 'init' ? 'green' : 'orange'}
          onClick={phase === 'init' ? handleStart : handleReset}
          disabled={dangerousButtonsDisabled}
        >
          {phase === 'init' ? ct.start : `${ct.reset} ${ct.fight.toLowerCase()}`}
        </Button>
        <Button
          className='orange'
          onClick={handleGoBack}
          disabled={dangerousButtonsDisabled}
        >
          {ct.back}
        </Button>
      </div>
    </main>
  )
}
