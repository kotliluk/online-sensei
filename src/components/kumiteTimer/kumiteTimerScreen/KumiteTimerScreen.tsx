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
import { buildFightCsv, ExportedFight, fightCsvFileName } from '../../../logic/fightLog/csv'
import { CSV_MIME_TYPE } from '../../../utils/csv'
import { exportFile, willShareFile } from '../../../logic/download/exportFile'


type PlayPhase = 'init' | 'fight' | 'finished'

/**
 * At module level so the setters built on them keep their identity. An arrow
 * written in the body would be a new function every render, which would make
 * every setter new as well and turn the dependencies of anything holding one
 * into a list that says it watches the fight while really running every tick.
 */
const isValidScore = (value: number): boolean => value >= 0 && value <= 99
const isValidFouls = (value: number): boolean => value >= 0 && value <= 5

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
  // typed explicitly: with a named validator the zero would otherwise be inferred
  // as the literal type and nothing else could ever be set
  const [scoreRed, setScoreRed] = useControlledState<number>(0, isValidScore)
  const [foulsRed, setFoulsRed] = useControlledState<number>(0, isValidFouls)
  const [scoreBlue, setScoreBlue] = useControlledState<number>(0, isValidScore)
  const [foulsBlue, setFoulsBlue] = useControlledState<number>(0, isValidFouls)
  const [senchu, setSenchu] = useState<Senchu>('NONE')

  // only while this tab owns the fight - see the note on the hook
  useLSSyncProvider(time, LS_KEYS.time, isActual)
  useLSSyncProvider(scoreRed, LS_KEYS.scoreRed, isActual)
  useLSSyncProvider(foulsRed, LS_KEYS.foulsRed, isActual)
  useLSSyncProvider(tournamentFight?.redName, LS_KEYS.nameRed, isActual)
  useLSSyncProvider(scoreBlue, LS_KEYS.scoreBlue, isActual)
  useLSSyncProvider(foulsBlue, LS_KEYS.foulsBlue, isActual)
  useLSSyncProvider(tournamentFight?.blueName, LS_KEYS.nameBlue, isActual)
  useLSSyncProvider(senchu, LS_KEYS.senchu, isActual)
  useLSSyncProvider(isTournamentFight ? tournamentName : undefined, LS_KEYS.tournamentName, isActual)

  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(true)
  const [clock] = useState<PausableInterval>(() => new PausableInterval(emptyFunc, 0))

  const [log, setLog] = useState<FightLogEntry[]>([])
  /** How long the log was when this fight was opened - see {@link handleGoBack}. */
  const [loadedLogLength, setLoadedLogLength] = useState(0)
  // the label says what the button does, and that depends on the device, not on the fight
  const [shares] = useState(() => willShareFile(CSV_MIME_TYPE))

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

  /**
   * What the seconds of the clock running do. Usually one of them; more when the browser
   * was away - a locked phone, a tab in the background - and the clock is telling the fight
   * how much wall time it owes.
   *
   * This lives on the tick rather than on the value of `time`, because those are not the
   * same thing: the referee can set the time by hand, and an effect watching the value
   * cannot tell that apart from the clock arriving there. It could be heard - give a second
   * back after the end and take it away again and the horn sounded a second time with a
   * second "end" in the log, and winding down onto 0:15 by hand called atoshibaraku across
   * the hall with the clock standing still.
   *
   * Giving time back after the end stays possible and stays silent; the horn belongs to the
   * clock reaching zero on its own.
   */
  const handleTick = useCallback((elapsedSeconds: number) => {
    // The clock starts from whatever the time says, zero included - the referee can wind it
    // down to nothing by hand and then press start. Comparing the new reading for equality
    // with zero lets that case straight past the end, and nothing downstream stops it: the
    // display counts on into negative time and the only way out is a reset, which takes the
    // score with it.
    const previous = timeRef.current
    const next = Math.max(0, previous - elapsedSeconds)
    setTime(next)

    if (next === 0) {
      playSignalEnd()
      setPhase('finished')
      setIsPaused(true)
      clock.pause()
      logEvent({ kind: 'END' }, 0)
    } else if (previous > 15 && next <= 15) {
      // Atoshibaraku is the call for a fight with under fifteen seconds left, not for the
      // instant the clock reads fifteen. Time caught up after a sleep can step over that
      // reading without landing on it, and testing for equality would mean the round it
      // stepped over never hears the call at all.
      playAtoshibaraku()
    }
  }, [setTime, setPhase, setIsPaused, clock, logEvent])

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
    clock.restart(handleTick, 1000)
    logEvent({ kind: 'START' })
  }, [setIsPaused, clock, handleTick, logEvent])

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

  /**
   * Exports what is on the screen, not what is stored: the button sits on the
   * timer, so a tournament fight has not been saved yet and has no winner - that
   * is chosen a screen later.
   */
  const handleExportCsv = useCallback(() => {
    const fight: ExportedFight = {
      tournamentName: tournamentFight ? tournamentName : undefined,
      redName: tournamentFight?.redName,
      blueName: tournamentFight?.blueName,
      redPoints: scoreRed,
      redFouls: foulsRed,
      bluePoints: scoreBlue,
      blueFouls: foulsBlue,
      senchu,
      log,
    }
    const content = buildFightCsv(fight, translation)

    exportFile(new File([content], fightCsvFileName(new Date()), { type: CSV_MIME_TYPE }))
  }, [tournamentFight, tournamentName, scoreRed, foulsRed, scoreBlue, foulsBlue, senchu, log, translation])

  /**
   * A tournament fight that has already been played is worth a question, because
   * Back sits next to Save and throws the whole thing away. A fight nothing has
   * happened in is not - asking about nothing is an annoyance, not a safeguard.
   *
   * "Something happened" is the log having grown since the fight was loaded.
   * Every change is logged, so a longer log is exactly that, and it is the only
   * reading that does not cry wolf on a reopened fight, whose log is not empty to
   * begin with.
   */
  const handleGoBack = useCallback(() => {
    if (tournamentFight && log.length > loadedLogLength) {
      dispatch(setModalWindow('LEAVE_FIGHT'))
      return
    }

    dispatch(setNotActualKumiteTimer())
    void navigate(tournamentFight ? '/kumite-timer/tournament' : '/kumite-timer/set-up')
  }, [dispatch, navigate, tournamentFight, log, loadedLogLength])

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
    const loaded = previous.length === 0 ? previous : [...previous, {
      at: Date.now(),
      fightTime: duration,
      event: { kind: 'REOPEN' as const, redPoints: tournamentFight.redPoints, bluePoints: tournamentFight.bluePoints },
    }]

    setLoadedLogLength(loaded.length)
    setLog(loaded)
  }, [tournamentFight, duration, setScoreRed, setFoulsRed, setScoreBlue, setFoulsBlue, setSenchu, setLog])

  useEffect(() => {
    preloadKumiteAudio()
    return () => {
      dispatch(setNotActualKumiteTimer())
      clock.pause()
    }
  }, [])


  /**
   * The redirect is here for one case: the screen opened without a session, by
   * a bookmark or a reload. Leaving the screen turns the same flag off, and then
   * it must not fire - whatever is leaving has already chosen where to go, and a
   * redirect landing on top of it sends the user somewhere else. That is what
   * used to happen to a tournament fight: both Back and saving the result asked
   * for the tournament table and arrived at the set-up screen instead.
   */
  const hadSession = useRef(isActual)

  useEffect(() => {
    if (isActual) {
      hadSession.current = true
      return
    }

    if (!hadSession.current) {
      void navigate('/kumite-timer/set-up')
    }
  }, [isActual, navigate])

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
          {phase === 'init' ? ct.start : ct.resetFight}
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

      <FightLog
        entries={log}
        action={(
          <Button className='export-btn' onClick={handleExportCsv}>
            {shares ? ct.shareCsv : ct.downloadCsv}
          </Button>
        )}
      />
    </main>
  )
}
