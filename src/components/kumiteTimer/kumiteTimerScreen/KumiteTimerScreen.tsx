// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './KumiteTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch, useThunkDispatch } from '../../../redux/useDispatch'
import { PausableInterval } from '../../../logic/timing/pausableInterval'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import {
  selectKumiteTimerDuration, selectKumiteTimerIsActual,
  selectKumiteTimerTournamentFight, selectKumiteTimerTournamentName,
} from '../../../redux/kumiteTimer/selector'
import { saveTournamentFight, setNotActualKumiteTimer } from '../../../redux/kumiteTimer/actions'
import { FighterStats } from '../fighterStats/FighterStats'
import useControlledState from '../../../logic/hooks/useControledState'
import { LS_KEYS } from '../utils'
import { FightStats } from '../fightStats/FightStats'
import { LIMITS } from '../../../redux/kumiteTimer/utils'
import { playAtoshibaraku, playSignalEnd, preloadKumiteAudio } from '../../../logic/audio/kumite'
import { useLSSyncProvider } from '../../../logic/hooks/useLSSyncProvider'
import { Senchu } from '../../../types/senchu'


type PlayPhase = 'init' | 'fight' | 'finished'

export const KumiteTimerScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectKumiteTimerIsActual)
  const duration = useSelector(selectKumiteTimerDuration)
  const tournamentFight = useSelector(selectKumiteTimerTournamentFight)
  const tournamentName = useSelector(selectKumiteTimerTournamentName)
  const isTournamentFight = tournamentFight !== null

  const [time, setTime] = useState(duration)
  const [redOnLeft, setRedOnLeft] = useState(true)
  const [scoreRed, setScoreRed] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsRed, setFoulsRed] = useControlledState(0, (value) => value >= 0 && value <= 5)
  const [scoreBlue, setScoreBlue] = useControlledState(0, (value) => value >= 0 && value <= 99)
  const [foulsBlue, setFoulsBlue] = useControlledState(0, (value) => value >= 0 && value <= 5)
  const [senchu, setSenchu] = useState<Senchu>('NONE')

  useLSSyncProvider(time, LS_KEYS.time)
  useLSSyncProvider(scoreRed, LS_KEYS.scoreRed)
  useLSSyncProvider(foulsRed, LS_KEYS.foulsRed)
  useLSSyncProvider(tournamentFight?.redName, LS_KEYS.nameRed)
  useLSSyncProvider(scoreBlue, LS_KEYS.scoreBlue)
  useLSSyncProvider(foulsBlue, LS_KEYS.foulsBlue)
  useLSSyncProvider(tournamentFight?.blueName, LS_KEYS.nameBlue)
  useLSSyncProvider(senchu, LS_KEYS.senchu)
  useLSSyncProvider(isTournamentFight ? tournamentName : undefined, LS_KEYS.tournamentName)

  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(true)
  const [clock] = useState<PausableInterval>(new PausableInterval(emptyFunc, 0))

  const dispatch = useDispatch()
  const thunkDispatch = useThunkDispatch()
  const history = useHistory()

  const handleManualTimeChange = useCallback((newTime: number) => {
    if (newTime >= 0 && newTime <= LIMITS.duration.max) {
      setTime(newTime)
    }
  }, [setTime])

  const handleManualTimeReset = useCallback(() => {
    setTime(duration)
  }, [setTime])

  const handleSwitchSides = useCallback(() => {
    setRedOnLeft(prev => !prev)
  }, [setRedOnLeft])

  const handleSenchuChange = useCallback((senchu: Senchu) => {
    setSenchu(prev => prev === senchu ? 'NONE' : senchu)
  }, [setSenchu])

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
    setPhase('fight')
    setIsPaused(false)
    clock.restart(() => setTime(prev => prev - 1), 1000)
  }, [isPaused, setIsPaused, setTime])

  const handleReset = useCallback(() => {
    setPhase('init')
    setIsPaused(true)
    setTime(duration)
    setScoreRed(0)
    setFoulsRed(0)
    setScoreBlue(0)
    setFoulsBlue(0)
    setSenchu('NONE')
    clock.pause()
  }, [isPaused, setIsPaused, setTime])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
    if (tournamentFight) {
      history.push('/kumite-timer/tournament')
    } else {
      history.push('/kumite-timer/set-up')
    }
  }, [dispatch, history, tournamentFight])

  const handleSaveTournamentFight = useCallback(() => {
    if (tournamentFight) {
      thunkDispatch(saveTournamentFight({
        uuid: tournamentFight.uuid,
        oppositeFight: tournamentFight.oppositeFight,
        winnerGoesTo: tournamentFight.winnerGoesTo,
        winner: 'RED',
        redPoints: scoreRed,
        redFouls: foulsRed,
        bluePoints: scoreBlue,
        blueFouls: foulsBlue,
        senchu: senchu,
      }))
    }
  }, [dispatch, tournamentFight, scoreRed, foulsRed, scoreBlue, foulsBlue, senchu])

  useEffect(() => {
    if (tournamentFight) {
      setScoreRed(tournamentFight.redPoints)
      setFoulsRed(tournamentFight.redFouls)
      setScoreBlue(tournamentFight.bluePoints)
      setFoulsBlue(tournamentFight.blueFouls)
      setSenchu(tournamentFight.senchu)
    }
  }, [tournamentFight])

  useEffect(() => {
    preloadKumiteAudio()
    return () => {
      dispatch(setNotActualKumiteTimer())
      clock.pause()
    }
  }, [])

  useEffect(() => {
    if (time === 0) {
      playSignalEnd()
      setPhase('finished')
      clock.pause()
    } else if (time === 15) {
      playAtoshibaraku()
    }
  }, [time])

  useEffect(() => {
    !isActual && history.push('/kumite-timer/set-up')
  }, [isActual])

  const renderRedData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={true}
      score={scoreRed}
      fouls={foulsRed}
      isMirror={false}
      onScoreChange={setScoreRed}
      onFoulsChange={setFoulsRed}
      name={tournamentFight?.redName}
    />
  ), [scoreRed, foulsRed, tournamentFight])

  const renderBlueData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={false}
      score={scoreBlue}
      fouls={foulsBlue}
      isMirror={false}
      onScoreChange={setScoreBlue}
      onFoulsChange={setFoulsBlue}
      name={tournamentFight?.blueName}
    />
  ), [scoreBlue, foulsBlue, tournamentFight])

  if (!isActual) {
    return null
  }

  const { common: ct, kumiteTimer: { timerScreen: t } } = translation

  const dangerousButtonsDisabled = phase === 'fight' && !isPaused

  return (
    <main className='kumite-timer'>
      {isTournamentFight && <h1>{tournamentName}</h1>}

      <div className='timer'>
        {redOnLeft ? renderRedData('left-fighter') : renderBlueData('left-fighter')}
        <FightStats
          className='fight-stats'
          time={time}
          redOnLeft={redOnLeft}
          senchu={senchu}
          isMirror={false}
          timeButtonsDisabled={dangerousButtonsDisabled}
          onTimeReset={handleManualTimeReset}
          onTimeChange={handleManualTimeChange}
          onSwitchSides={handleSwitchSides}
          onSenchuChange={handleSenchuChange}
        />
        {redOnLeft ? renderBlueData('right-fighter') : renderRedData('right-fighter')}
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
        {isTournamentFight && (
          <Button
            // TODO - add winner confirmation
            className='orange'
            onClick={handleSaveTournamentFight}
            disabled={dangerousButtonsDisabled}
          >
            {t.saveTournamentFight}
          </Button>
        )}
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
