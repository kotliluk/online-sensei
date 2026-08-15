import { JSX, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './KumiteTimerScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { PausableInterval } from '../../../logic/timing/pausableInterval'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import {
  selectKumiteTimerDuration, selectKumiteTimerIsActual,
  selectKumiteTimerTournamentFight, selectKumiteTimerTournamentName,
} from '../../../redux/kumiteTimer/selector'
import { setNotActualKumiteTimer, setTournamentFight } from '../../../redux/kumiteTimer/actions'
import { FighterStats } from '../fighterStats/FighterStats'
import useControlledState from '../../../logic/hooks/useControledState'
import { LS_KEYS } from '../utils'
import { FightStats } from '../fightStats/FightStats'
import { LIMITS } from '../../../redux/kumiteTimer/utils'
import { playAtoshibaraku, playSignalEnd, preloadKumiteAudio } from '../../../logic/audio/kumite'
import { useLSSyncProvider } from '../../../logic/hooks/useLSSyncProvider'
import { Senchu } from '../../../types/senchu'
import { setModalWindow } from '../../../redux/page/actions'
import { appendFightEvent, FightEvent, FightLogEntry } from '../../../types/fightLog'
import { FightLog } from '../fightLog/FightLog'


type PlayPhase = 'init' | 'fight' | 'finished'

// TODO - update mobile phone view
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

  const [log, setLog] = useState<FightLogEntry[]>([])

  /**
   * The clock is read through a ref so the handlers do not have to be rebuilt
   * every second - a stale `time` captured in one of them would put the wrong
   * moment in the log. Callers that already know the reading pass it in, because
   * the ref only catches up after the render that changed the state.
   */
  const timeRef = useRef(time)

  useEffect(() => {
    timeRef.current = time
  }, [time])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logEvent = useCallback((event: FightEvent, fightTime = timeRef.current) => {
    setLog((prev) => appendFightEvent(prev, { at: Date.now(), fightTime, event }))
  }, [setLog])

  const handleManualTimeChange = useCallback((newTime: number) => {
    if (newTime >= 0 && newTime <= LIMITS.duration.max) {
      setTime(newTime)
      logEvent({ kind: 'TIME_SET', from: timeRef.current, to: newTime })
    }
  }, [setTime, logEvent])

  const handleManualTimeReset = useCallback(() => {
    setTime(duration)
    logEvent({ kind: 'TIME_SET', from: timeRef.current, to: duration })
  }, [setTime, duration, logEvent])

  // which corner is shown on which side is a matter of the view, not of the fight
  const handleSwitchSides = useCallback(() => {
    setRedOnLeft(prev => !prev)
  }, [setRedOnLeft])

  const handleSenchuChange = useCallback((value: Senchu) => {
    const newSenchu = senchu === value ? 'NONE' : value

    setSenchu(newSenchu)
    logEvent({ kind: 'SENCHU', from: senchu, to: newSenchu })
  }, [senchu, setSenchu, logEvent])

  // the score setters take the new total, so what was awarded is the difference
  const handleScoreRedChange = useCallback((value: number) => {
    if (setScoreRed(value)) {
      logEvent({ kind: 'POINTS', side: 'RED', delta: value - scoreRed })
    }
  }, [scoreRed, setScoreRed, logEvent])

  const handleScoreBlueChange = useCallback((value: number) => {
    if (setScoreBlue(value)) {
      logEvent({ kind: 'POINTS', side: 'BLUE', delta: value - scoreBlue })
    }
  }, [scoreBlue, setScoreBlue, logEvent])

  const handleFoulsRedChange = useCallback((value: number) => {
    if (setFoulsRed(value)) {
      logEvent({ kind: 'FOULS', side: 'RED', from: foulsRed, to: value })
    }
  }, [foulsRed, setFoulsRed, logEvent])

  const handleFoulsBlueChange = useCallback((value: number) => {
    if (setFoulsBlue(value)) {
      logEvent({ kind: 'FOULS', side: 'BLUE', from: foulsBlue, to: value })
    }
  }, [foulsBlue, setFoulsBlue, logEvent])

  const handleTogglePause = useCallback(() => {
    if (phase === 'finished') {
      return
    }

    if (isPaused) {
      setIsPaused(false)
      clock.resume()
      logEvent({ kind: 'RESUME' })
    } else {
      setIsPaused(true)
      clock.pause()
      logEvent({ kind: 'PAUSE' })
    }
  }, [phase, isPaused, setIsPaused, clock, logEvent])

  const handleStart = useCallback(() => {
    setPhase('fight')
    setIsPaused(false)
    clock.restart(() => setTime(prev => prev - 1), 1000)
    logEvent({ kind: 'START' })
  }, [setIsPaused, setTime, clock, logEvent])

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
    // the log is kept on purpose - it is the record of what happened at the
    // table, and it is the one thing the reset cannot give back
    logEvent({ kind: 'RESET' })
  }, [duration, setIsPaused, setTime, setScoreRed, setFoulsRed, setScoreBlue, setFoulsBlue, setSenchu, clock, logEvent])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualKumiteTimer())
    if (tournamentFight) {
      void navigate('/kumite-timer/tournament')
    } else {
      void navigate('/kumite-timer/set-up')
    }
  }, [dispatch, navigate, tournamentFight])

  const handleSaveTournamentFight = useCallback(() => {
    if (tournamentFight) {
      dispatch(setTournamentFight({
        ...tournamentFight,
        redPoints: scoreRed,
        redFouls: foulsRed,
        bluePoints: scoreBlue,
        blueFouls: foulsBlue,
        senchu: senchu,
        log,
      }))
      dispatch(setModalWindow('FIGHT_RESULT'))
    }
  }, [dispatch, tournamentFight, scoreRed, foulsRed, scoreBlue, foulsBlue, senchu, log])

  /**
   * Keyed on which fight it is rather than on the object it came in: saving a
   * fight dispatches a new one, and loading from that would wipe the log the
   * fight has just been given and mark it as reopened on top of that.
   */
  const loadedFightUuid = useRef<string | null>(null)

  useEffect(() => {
    if (!tournamentFight || loadedFightUuid.current === tournamentFight.uuid) {
      return
    }

    loadedFightUuid.current = tournamentFight.uuid

    setScoreRed(tournamentFight.redPoints)
    setFoulsRed(tournamentFight.redFouls)
    setScoreBlue(tournamentFight.bluePoints)
    setFoulsBlue(tournamentFight.blueFouls)
    setSenchu(tournamentFight.senchu)

    // a fight opened again carries on its own log rather than starting a new one
    const previous = tournamentFight.log ?? []

    setLog(previous.length === 0 ? previous : [...previous, {
      at: Date.now(),
      fightTime: duration,
      event: { kind: 'REOPEN', redPoints: tournamentFight.redPoints, bluePoints: tournamentFight.bluePoints },
    }])
  }, [tournamentFight, duration, setScoreRed, setFoulsRed, setScoreBlue, setFoulsBlue, setSenchu, setLog])

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
      logEvent({ kind: 'END' }, 0)
    } else if (time === 15) {
      playAtoshibaraku()
    }
    // both the clock and logEvent keep their identity, so this still only runs on a tick
  }, [time, clock, logEvent])

  useEffect(() => {
    if (!isActual) {
      void navigate('/kumite-timer/set-up')
    }
  }, [isActual])

  const renderRedData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={true}
      score={scoreRed}
      fouls={foulsRed}
      isMirror={false}
      onScoreChange={handleScoreRedChange}
      onFoulsChange={handleFoulsRedChange}
      name={tournamentFight?.redName}
    />
  ), [scoreRed, foulsRed, tournamentFight, handleScoreRedChange, handleFoulsRedChange])

  const renderBlueData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={false}
      score={scoreBlue}
      fouls={foulsBlue}
      isMirror={false}
      onScoreChange={handleScoreBlueChange}
      onFoulsChange={handleFoulsBlueChange}
      name={tournamentFight?.blueName}
    />
  ), [scoreBlue, foulsBlue, tournamentFight, handleScoreBlueChange, handleFoulsBlueChange])

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

      <FightLog entries={log} />
    </main>
  )
}
