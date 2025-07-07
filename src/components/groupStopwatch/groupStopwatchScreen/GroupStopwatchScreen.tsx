// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
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
import { parseMinTime } from '../../../utils/time'
import { Competitor, newCompetitor } from '../../../types/groupStopwatch'
import { PausableStopwatch } from '../../../logic/timing/pausableStopwatch'
import { Results } from '../results/Results'


type PlayPhase = 'init' | 'running' | 'paused' | 'results'

export const GroupStopwatchScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectGroupStopwatchIsActual)
  const competitorCount = useSelector(selectGroupStopwatchCompetitorsCount)
  const competitorNames = useSelector(selectGroupStopwatchCompetitors)

  // current time in milliseconds
  const [currTime, setCurrTime] = useState(0)
  const [actualLeadingTimeUnit, setActualLeadingTimeUnit] = useState<'seconds' | 'minutes' | 'hours'>('seconds')
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [clock] = useState<PausableStopwatch>(new PausableStopwatch(emptyFunc, 0))
  const [competitors, setCompetitors] = useState<Competitor[]>(
    competitorNames.slice(0, competitorCount).map((name, index) => newCompetitor(index + 1, name)),
  )

  const dispatch = useDispatch()
  const history = useHistory()

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
          return {
            ...c,
            lastClick: now,
          }
        }
      }
      return c
    }))
  }, [setCompetitors, actualLeadingTimeUnit])

  const recomputeCompetitorTimeStrings = useCallback((leadingTimeUnit: 'seconds' | 'minutes' | 'hours') => {
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
    setCompetitors(prevCompetitors => prevCompetitors.map((c) => ({
      ...c,
      time: null,
      timeString: '--.--',
    })))
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
    !isActual && history.push('/group-stopwatch/set-up')
  }, [isActual])

  if (!isActual) {
    return null
  }

  const { groupStopwatch: { playScreen: t }, common: ct } = translation

  const inProgress = phase === 'running' || phase === 'paused'

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
            <div
              className={`competitor-card ${competitor.time !== null ? 'finished' : ''}`}
              key={competitor.id}
              onClick={() => handleCompetitorClick(competitor.id, currTime)}
            >
              <p className='competitor-name'>{competitor.id}) {competitor.name}</p>
              <p className='competitor-time'>{competitor.timeString}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
