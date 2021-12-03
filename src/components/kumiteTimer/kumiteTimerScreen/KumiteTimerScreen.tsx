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
import { selectKumiteTimerDuration, selectKumiteTimerIsActual } from '../../../redux/kumiteTimer/selector'
import { setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'
import { FighterStats } from '../fighterStats/FighterStats'
import useControlledState from '../../../logic/hooks/useControledState'


type PlayPhase = 'init' | 'fight' | 'finished'

type Senchu = 'NONE' | 'RED' | 'BLUE'

export const KumiteTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectKumiteTimerIsActual)
  const duration = useSelector(selectKumiteTimerDuration)

  const [seconds, setSeconds] = useState(0)
  const [scoreRed, setScoreRed] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsOneRed, setFoulsOneRed] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [foulsTwoRed, setFoulsTwoRed] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [scoreBlue, setScoreBlue] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsOneBlue, setFoulsOneBlue] = useControlledState(0, (value) => value >= 0 && value <= 4)
  const [foulsTwoBlue, setFoulsTwoBlue] = useControlledState(0, (value) => value >= 0 && value <= 4)
  // TODO - atoshibaraku
  const [senchu, setSenchu] = useState<Senchu>('NONE')

  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(false)
  const [timeoutObj] = useState<PausableInterval>(new PausableInterval(emptyFunc, 0))

  const dispatch = useDispatch()
  const history = useHistory()

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

  const handleReset = useCallback(() => {
    setPhase('fight')
    setIsPaused(false)
    setSeconds(0)
    timeoutObj.restart(() => {
      console.log(new Date().toISOString())
      setSeconds(prev => prev + 1)
    }, 1000)
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
    if (seconds === duration) {
      console.log('FINISH')
      setPhase('finished')
      timeoutObj.pause()
    }
  }, [seconds])

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

  // TODO - translation
  const { reactions: { playScreen: t }, common: ct } = translation

  return (
    <main className='kumite-timer'>
      <h1>Kumite timer</h1>

      <div className='timer'>
        {renderRedData('left')}
        <h1 className='common'>{seconds}</h1>
        {renderBlueData('right')}
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
          onClick={handleReset}
          disabled={phase === 'fight' && !isPaused}
        >
          {phase === 'init' ? ct.start : ct.reset}
        </Button>
        <Button
          className='orange'
          onClick={handleGoBack}
          disabled={phase === 'fight' && !isPaused}
        >
          {ct.back}
        </Button>
      </div>
    </main>
  )
}
