import { JSX, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './GroupStopwatchScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { useDispatch } from '../../../redux/useDispatch'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import {
  selectGroupStopwatchCompetitors,
  selectGroupStopwatchCompetitorsCount,
  selectGroupStopwatchIsActual,
} from '../../../redux/groupStopwatch/selector'
import { setNotActualGroupStopwatch } from '../../../redux/groupStopwatch/actions'
import { LeadingTimeUnit, parseMinTime } from '../../../utils/time'
import {
  clearCompetitorTime,
  Competitor,
  newCompetitor,
  shiftCompetitorTime,
} from '../../../types/groupStopwatch'
import { PausableStopwatch } from '../../../logic/timing/pausableStopwatch'
import { useWakeLock } from '../../../logic/hooks/useWakeLock'
import { useLeaveQuestion } from '../../../logic/hooks/useLeaveQuestion'
import { Results } from '../results/Results'
import { CompetitorCard } from './CompetitorCard'


type PlayPhase = 'init' | 'running' | 'paused' | 'results'

export const GroupStopwatchScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectGroupStopwatchIsActual)
  const competitorCount = useSelector(selectGroupStopwatchCompetitorsCount)
  const competitorNames = useSelector(selectGroupStopwatchCompetitors)

  // current time in milliseconds
  const [currTime, setCurrTime] = useState(0)
  const [actualLeadingTimeUnit, setActualLeadingTimeUnit] = useState<LeadingTimeUnit>('seconds')
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [clock] = useState<PausableStopwatch>(() => new PausableStopwatch(emptyFunc, 0))

  // the phone lies on the table while the times of a whole group are written down
  useWakeLock(isActual)
  // nothing here is written down anywhere, so a run in progress is worth a question
  useLeaveQuestion(isActual ? 'SESSION' : null)
  const [competitors, setCompetitors] = useState<Competitor[]>(
    competitorNames.slice(0, competitorCount).map((c, index) => newCompetitor(index + 1, c.name, c.color)),
  )

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleCompetitorClick = useCallback((id: number, time: number) => {
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => {
      if (c.id === id) {
        const now = new Date().getTime()
        // save time for the first time or rewrite it only if 2 clicks within 2 seconds
        if (c.time === null || (now - c.lastClick) < 2000) {
          return {
            ...c,
            time,
            timeString: parseMinTime(time / 1000, 2, actualLeadingTimeUnit),
            lastClick: now,
          }
        } else {
          // Any tap opens the window, including this one, which changes nothing else.
          // That is what makes a correction possible at all later in the race - see the
          // tests, which also pin down the hazard that comes with it.
          return {
            ...c,
            lastClick: now,
          }
        }
      }
      return c
    }))
  }, [setCompetitors, actualLeadingTimeUnit])

  const handleShiftTime = useCallback((id: number, deltaMs: number) => {
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => (
      c.id === id ? shiftCompetitorTime(c, deltaMs, actualLeadingTimeUnit) : c
    )))
  }, [setCompetitors, actualLeadingTimeUnit])

  const handleClearTime = useCallback((id: number) => {
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => (
      c.id === id ? clearCompetitorTime(c, actualLeadingTimeUnit) : c
    )))
  }, [setCompetitors, actualLeadingTimeUnit])

  const recomputeCompetitorTimeStrings = useCallback((leadingTimeUnit: LeadingTimeUnit) => {
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => ({
      ...c,
      timeString: parseMinTime(c.time !== null ? c.time / 1000 : null, 2, leadingTimeUnit),
    })))
  }, [setCompetitors])

  useEffect(() => {
    if (currTime >= 60 * 60 * 1000) {
      if (actualLeadingTimeUnit !== 'hours') {
        setActualLeadingTimeUnit('hours')
        recomputeCompetitorTimeStrings('hours')
      }
    } else if (currTime >= 60 * 1000) {
      if (actualLeadingTimeUnit !== 'minutes') {
        setActualLeadingTimeUnit('minutes')
        recomputeCompetitorTimeStrings('minutes')
      }
    } else {
      if (actualLeadingTimeUnit !== 'seconds') {
        setActualLeadingTimeUnit('seconds')
        recomputeCompetitorTimeStrings('seconds')
      }
    }
  }, [currTime, actualLeadingTimeUnit, setActualLeadingTimeUnit, recomputeCompetitorTimeStrings])

  const handleTogglePause = useCallback(() => {
    if (phase === 'paused') {
      setPhase('running')
      clock.resume()
    } else if (phase === 'running') {
      setPhase('paused')
      clock.pause()
    }
  }, [phase, setPhase, clock])

  const handleStart = useCallback(() => {
    setPhase('running')
    clock.restart(setCurrTime, 45)
  }, [setPhase, setCurrTime, clock])

  const handleReset = useCallback(() => {
    setPhase('init')
    setCurrTime(0)
    // back to seconds along with the clock, which starts from zero again
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => clearCompetitorTime(c, 'seconds')))
    clock.stop()
  }, [setPhase, setCurrTime, setCompetitors])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualGroupStopwatch())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setNotActualGroupStopwatch())
      clock.pause()
    }
  }, [])

  useEffect(() => {
    if (!isActual) {
      void navigate('/group-stopwatch/set-up', { replace: true })
    }
  }, [isActual])

  if (!isActual) {
    return null
  }

  const { groupStopwatch: { playScreen: t }, common: ct } = translation

  const inProgress = phase === 'running' || phase === 'paused'
  const finishedCount = competitors.filter((c) => c.time !== null).length

  if (phase === 'results') {
    return (
      <main className='play-group-stopwatch'>
        <Results
          competitors={competitors}
          onBackToStopwatch={() => setPhase(clock.isRunning() ? 'running' : 'paused')}
        />
      </main>
    )
  }

  return (
    <main className='play-group-stopwatch'>
      <div className='play-group-stopwatch-time-controls'>
        <div>
          <span className='time'>{parseMinTime(currTime / 1000, 2, actualLeadingTimeUnit)}</span>
        </div>

        {/* who is still out there, in numbers only - it needs no word in either language */}
        <div className='finished-count'>{finishedCount} / {competitors.length}</div>

        <div className='buttons'>
          <Button
            className={phase === 'paused' ? 'green' : 'orange'}
            onClick={handleTogglePause}
            disabled={!inProgress}
          >
            {phase === 'paused' ? ct.resume : ct.pause}
          </Button>
          <Button
            className={phase === 'init' ? 'green' : 'orange'}
            onClick={phase === 'init' ? handleStart : handleReset}
            disabled={phase === 'running'}
          >
            {phase === 'init' ? ct.start : ct.reset}
          </Button>
          <Button
            className='orange'
            onClick={() => setPhase('results')}
            disabled={phase === 'init'}
          >
            {t.results}
          </Button>
          <Button
            className='orange'
            onClick={handleGoBack}
            disabled={phase === 'running'}
          >
            {ct.back}
          </Button>
        </div>
      </div>

      <div className='play-group-stopwatch-competitors-wrapper'>
        <div className='play-group-stopwatch-competitors'>
          {competitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onSaveTime={() => handleCompetitorClick(competitor.id, currTime)}
              onClearTime={() => handleClearTime(competitor.id)}
              onShiftTime={(deltaMs) => handleShiftTime(competitor.id, deltaMs)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
