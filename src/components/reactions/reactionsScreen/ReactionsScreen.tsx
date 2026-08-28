import { JSX, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReactionsScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsAudioSound,
  selectReactionsAudioVolume,
  selectReactionsIsActual,
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsRounds,
  selectReactionsSignalColors, selectReactionsSignalCount,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setNotActualReactions } from '../../../redux/reactions/actions'
import { getRandomInt } from '../../../utils/random'
import { PausableTimeout } from '../../../logic/timing/pausableTimeout'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../../atoms/button/Button'
import { playBeep } from '../../../logic/audio/beep'
import { selectTranslation } from '../../../redux/page/selector'


type PlayPhase = 'init' | 'start' | 'signal' | 'waiting' | 'finished'

export const ReactionsScreen = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)

  const isActual = useSelector(selectReactionsIsActual)
  const rounds = useSelector(selectReactionsRounds)
  const signalDuration = useSelector(selectReactionsSignalDuration)
  const minInterval = useSelector(selectReactionsMinInterval)
  const maxInterval = useSelector(selectReactionsMaxInterval)
  const signalCount = useSelector(selectReactionsSignalCount)
  const signalColors = useSelector(selectReactionsSignalColors)
  const audioSound = useSelector(selectReactionsAudioSound)
  const audioVolume = useSelector(selectReactionsAudioVolume)

  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<PlayPhase>('init')
  const [isPaused, setIsPaused] = useState(false)
  const [curSignal, setCurSignal] = useState(0)
  // bumped by reset, so a fresh run is a change even when the phase is the same one
  const [runId, setRunId] = useState(0)
  const [timeoutObj] = useState<PausableTimeout>(() => new PausableTimeout(emptyFunc, 0))

  const dispatch = useDispatch()
  const navigate = useNavigate()

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
    setPhase('start')
    setIsPaused(false)
    setRound(0)
    // Starting over has to be said out loud rather than inferred from the phase. Reset
    // pressed during the very first wait sets the phase it already holds, React sees no
    // change, and the effect that arms the next signal never runs again - leaving a screen
    // that claims to be running with a paused timer behind it, and with reset and back
    // both disabled there is no way out of it.
    setRunId((prev) => prev + 1)
  }, [setIsPaused, setRound, setRunId])

  const handleGoBack = useCallback(() => {
    dispatch(setNotActualReactions())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setNotActualReactions())
      timeoutObj.pause()
    }
  }, [])

  useEffect(() => {
    if (phase === 'start' || phase === 'waiting') {
      // WAITING phase has started
      if (round === rounds) {
        setPhase('finished')
      } else {
        timeoutObj.restart(() => {
          setCurSignal(getRandomInt(0, signalCount))
          setPhase('signal')
        }, getRandomInt(minInterval, maxInterval))
      }
    } else if (phase === 'signal') {
      // SIGNAL phase has started
      playBeep(audioSound, signalDuration, audioVolume)
      timeoutObj.restart(() => {
        setRound(prev => prev + 1)
        setPhase('waiting')
      }, signalDuration)
    }
  }, [phase, runId])

  useEffect(() => {
    if (!isActual) {
      void navigate('/reactions/set-up')
    }
  }, [isActual])

  if (!isActual) {
    return null
  }

  const { reactions: { playScreen: t }, common: ct } = translation

  const inProgress = phase === 'waiting' || phase === 'signal' || phase === 'start'

  return (
    <main className='play-reactions'>
      <h1>{t.heading}</h1>
      <p>
        {round < rounds && `${t.round}: ${round + 1}/${rounds}`}
        {round === rounds && `${ct.finished}!`}
      </p>

      <div className={`signal-boxes boxes-${signalCount}`}>
        {signalColors.slice(0, signalCount).map((color, i) => (
          <div
            key={i}
            className='signal-box'
            style={(phase === 'signal' && curSignal === i) ? { backgroundColor: color } : {}}
          />
        ))}
      </div>

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
          onClick={handleReset}
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
