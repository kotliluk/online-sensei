import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './SetUpScreenAdvanced.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { SoundSelect } from '../../common/soundSelect/SoundSelect'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import {
  selectIntervalTimerAdvancedLastLoadTime,
  selectIntervalTimerAdvancedRoundIntervals,
  selectIntervalTimerAdvancedRounds,
  selectIntervalTimerAudioSound,
  selectIntervalTimerAudioVolume,
  selectIntervalTimerSkipLastPause,
} from '../../../redux/intervalTimer/selector'
import { LIMITS, VALIDATOR } from '../../../redux/intervalTimer/utils'
import { setIntervalTimerAdvanced, setNotActualIntervalTimer } from '../../../redux/intervalTimer/actions'
import { SetUpAdvancedInterval } from '../setUpAdvancedInterval/SetUpAdvancedInterval'
import { Interval, IntervalType } from '../../../types/interval'
import { setModalWindow } from '../../../redux/page/actions'
import { ShareButton } from '../../common/shareButton/ShareButton'
import { buildAppUrl } from '../../../logic/urlState/appUrl'
import {
  decodeIntervalTimerAdvancedSetUp,
  encodeIntervalTimerAdvancedSetUp,
  hasIntervalTimerAdvancedSetUp,
  INTERVAL_TIMER_ADVANCED_SET_UP_PATH,
} from '../../../logic/urlState/intervalTimerUrl'
import { useClearUrlOnEdit } from '../../../logic/urlState/useClearUrlOnEdit'


export const SetUpScreenAdvanced = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const { intervalTimer: { setUpScreenAdvanced: t } } = translation

  const initIntervals = useSelector(selectIntervalTimerAdvancedRoundIntervals)
  const initRounds = useSelector(selectIntervalTimerAdvancedRounds)
  const initAudioSound = useSelector(selectIntervalTimerAudioSound)
  const initAudioVolume = useSelector(selectIntervalTimerAudioVolume)
  const initSkipLastPause = useSelector(selectIntervalTimerSkipLastPause)
  const lastLoadTime = useSelector(selectIntervalTimerAdvancedLastLoadTime)

  const [searchParams] = useSearchParams()

  // A shared link fully describes a set up, so it wins over the stored one.
  // Computed once - later edits must not be overwritten by the URL.
  const [init] = useState(() => {
    const stored = {
      advancedRoundIntervals: initIntervals,
      advancedRounds: initRounds,
      skipLastPause: initSkipLastPause,
      audioSound: initAudioSound,
      audioVolume: initAudioVolume,
    }

    return hasIntervalTimerAdvancedSetUp(searchParams) ? decodeIntervalTimerAdvancedSetUp(searchParams) : stored
  })

  const [intervals, setIntervals, isValidIntervals] = useValidatedState(
    init.advancedRoundIntervals,
    VALIDATOR.advancedRoundIntervals,
  )
  const [rounds, setRounds, isValidRounds] = useValidatedState(init.advancedRounds, VALIDATOR.advancedRounds)
  const [audioSound, setAudioSound] = useState(init.audioSound)
  const [audioVolume, setAudioVolume] = useState(init.audioVolume)
  const [skipLastPause, setSkipLastPause] = useState(init.skipLastPause)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const listRef = useRef<HTMLUListElement>(null)
  const focusAfterMove = useRef<{ index: number, direction: 'UP' | 'DOWN' } | null>(null)

  // which row was just moved, so that it can say so; null once it has finished saying it
  const [justMoved, setJustMoved] = useState<number | null>(null)

  const handleIntervalChange = useCallback((newValue: Interval, index: number) => {
    const newIntervals = [...intervals]
    newIntervals[index] = newValue
    setIntervals(newIntervals)
  }, [intervals, setIntervals])

  const handleIntervalDelete = useCallback((index: number) => {
    if (intervals.length > 1) {
      const newIntervals = [...intervals]
      newIntervals.splice(index, 1)
      setIntervals(newIntervals)
      // everything below the gap shifts up, so a highlight left over from a move would end
      // up pointing at whichever interval took the row
      setJustMoved(null)
    }
  }, [intervals, setIntervals])

  // `to` is where the interval ends up. Dropping used to mean "insert before this gap",
  // which is why this had to shift the target and refuse the two gaps touching the
  // interval itself; an arrow names a row instead.
  const handleIntervalMove = useCallback((from: number, to: number) => {
    // The arrows at the ends of the list are disabled, so this is the second lock rather
    // than the first. It is here because the failure is not a no-op: `splice(-1, 0, x)`
    // counts from the end and would quietly drop the interval in before the last one.
    if (to < 0 || to >= intervals.length) {
      return
    }

    const newIntervals = [...intervals]
    newIntervals.splice(from, 1)
    newIntervals.splice(to, 0, intervals[from])
    setIntervals(newIntervals)

    focusAfterMove.current = { index: to, direction: (to > from) ? 'DOWN' : 'UP' }
    setJustMoved(to)
  }, [intervals, setIntervals])

  // The row swaps its contents in place, so without this the list simply looks different
  // afterwards and it is on the eye to work out which interval went where - and the next
  // tap on the same spot then moves a different one. The colour says which row is the one
  // that just moved, and fades out on its own.
  useEffect(() => {
    if (justMoved === null) {
      return
    }

    const timeout = setTimeout(() => setJustMoved(null), 1200)

    return () => clearTimeout(timeout)
  }, [justMoved])

  // A row is keyed by its position, so reordering swaps what the buttons are given rather
  // than moving them: the arrow that was just pressed stays where it is and now belongs to
  // the interval that took the old place, and pressing it again would undo the move. So an
  // interval could not be walked through the list at all without letting go of the button
  // in between. Focus goes to the same arrow on the row the interval landed on - or to the
  // other one, when the end of the list has just switched that arrow off.
  useEffect(() => {
    const move = focusAfterMove.current

    if (move === null) {
      return
    }

    focusAfterMove.current = null

    const row = listRef.current?.children[move.index]
    const moved = row?.querySelector(`[data-move='${move.direction}']`)
    const other = row?.querySelector(`[data-move='${(move.direction === 'UP') ? 'DOWN' : 'UP'}']`)
    const target = (moved instanceof HTMLButtonElement && !moved.disabled) ? moved : other

    if (target instanceof HTMLButtonElement) {
      target.focus()
    }
  }, [intervals])

  const handleIntervalAdd = useCallback(() => {
    const newIntervals = [
      ...intervals,
      { type: 'work' as IntervalType, name: t.intervalInSeries.type.work, duration: 20 },
    ]
    setIntervals(newIntervals)
  }, [intervals, setIntervals])

  const handleLoadSeries = useCallback(() => {
    dispatch(setModalWindow('LOAD_ADVANCED_SERIES'))
  }, [dispatch])

  const handleSaveSeries = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    dispatch(setModalWindow('SAVE_ADVANCED_SERIES'))
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

  const handleGoToBasicSettings = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    void navigate('/interval-timer/set-up')
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

  const handleStart = useCallback(() => {
    dispatch(setIntervalTimerAdvanced(intervals, rounds, skipLastPause, audioSound, audioVolume))
    void navigate('/interval-timer')
  }, [dispatch, intervals, rounds, skipLastPause, audioSound, audioVolume])

  const shareParams = useMemo(() => encodeIntervalTimerAdvancedSetUp({
    advancedRoundIntervals: intervals,
    advancedRounds: rounds,
    skipLastPause,
    audioSound,
    audioVolume,
  }), [intervals, rounds, skipLastPause, audioSound, audioVolume])

  const buildShareUrl = useCallback(() => buildAppUrl(INTERVAL_TIMER_ADVANCED_SET_UP_PATH, shareParams), [shareParams])

  // the link stops describing the screen as soon as anything is edited
  useClearUrlOnEdit(shareParams)

  const handleBack = useCallback(() => {
    dispatch(setNotActualIntervalTimer())
    void navigate('/')
  }, [dispatch])

  // handles change of init values when lastLoadTime has changed; the first run
  // is skipped so that it does not overwrite a set up taken from the URL
  const isFirstLoadTimeRun = useRef(true)

  useEffect(() => {
    if (isFirstLoadTimeRun.current) {
      isFirstLoadTimeRun.current = false
      return
    }

    setIntervals(initIntervals)
    setRounds(initRounds)
    setAudioSound(initAudioSound)
    setAudioVolume(initAudioVolume)
    setSkipLastPause(initSkipLastPause)
  }, [lastLoadTime])

  return (
    <main className='set-up-interval-timer-advanced'>
      <h1>{t.heading}</h1>

      <h3>{t.intervalInSeriesSubheading}:</h3>

      <ul className='set-up-items' ref={listRef}>
        {intervals.map((interval, index) => (
          <li
            key={index}
            className='set-up-item advanced-interval-li'
          >
            <SetUpAdvancedInterval
              index={index}
              interval={interval}
              onChange={(interval) => handleIntervalChange(interval, index)}
              onDelete={() => handleIntervalDelete(index)}
              onMove={(to) => handleIntervalMove(index, to)}
              isLast={index === (intervals.length - 1)}
              justMoved={index === justMoved}
              disabledDelete={intervals.length === 1}
              translation={t.intervalInSeries}
            />
          </li>
        ))}
      </ul>

      <div className='buttons middle-buttons'>
        <Button
          className='add-interval-btn'
          onClick={handleIntervalAdd}
        >
          {t.addIntervalInSeriesBtn}
        </Button>
        <Button
          className='add-interval-btn'
          onClick={handleLoadSeries}
        >
          {t.loadSeries}
        </Button>
        <Button
          className='add-interval-btn'
          onClick={handleSaveSeries}
        >
          {t.saveSeries}
        </Button>
      </div>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.series.label}:</label>
          <NumberInput
            className='set-up-input'
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.series.error, LIMITS.advancedRounds.min, LIMITS.advancedRounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <SoundSelect
            sound={audioSound}
            volume={audioVolume}
            onSoundChange={setAudioSound}
            onVolumeChange={setAudioVolume}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.skipLastPause.label}:</label>
          <CheckBox
            // className='set-up-input'
            checked={skipLastPause}
            onChange={setSkipLastPause}
          />
        </li>
      </ul>

      <div className='buttons'>
        <Button
          className='basic-settings-btn'
          onClick={handleGoToBasicSettings}
        >
          {t.basicSettingsBtn}
        </Button>

        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isValidIntervals || !isValidRounds}
        >
          {translation.common.start}
        </Button>

        <ShareButton
          buildUrl={buildShareUrl}
          disabled={!isValidIntervals || !isValidRounds}
        />

        <Button
          className='back-btn'
          onClick={handleBack}
        >
          {translation.common.back}
        </Button>
      </div>
    </main>
  )
}
