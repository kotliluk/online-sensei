import { JSX, useCallback, useEffect, useMemo, useState } from 'react'
import './SetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { setNotActualReactions, setReactions } from '../../../redux/reactions/actions'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import {
  selectReactionsAudioSound,
  selectReactionsAudioVolume,
  selectReactionsMaxInterval,
  selectReactionsMinInterval,
  selectReactionsRounds,
  selectReactionsSignalColors, selectReactionsSignalCount,
  selectReactionsSignalDuration,
} from '../../../redux/reactions/selector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { joinErrorMessages } from '../../../utils/error'
import { LIMITS, VALIDATOR } from '../../../redux/reactions/utils'
import { preloadBeep } from '../../../logic/audio/beep'
import { SoundSelect } from '../../common/soundSelect/SoundSelect'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import { CounterInput } from '../../atoms/input/CounterInput'
import { ShareButton } from '../../common/shareButton/ShareButton'
import { buildAppUrl } from '../../../logic/urlState/appUrl'
import {
  decodeReactionsSetUp,
  encodeReactionsSetUp,
  hasReactionsSetUp,
  REACTIONS_SET_UP_PATH,
} from '../../../logic/urlState/reactionsUrl'
import { useClearUrlOnEdit } from '../../../logic/urlState/useClearUrlOnEdit'


export const SetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initRounds = useSelector(selectReactionsRounds)
  const initSignalDuration = useSelector(selectReactionsSignalDuration)
  const initMinInterval = useSelector(selectReactionsMinInterval)
  const initMaxInterval = useSelector(selectReactionsMaxInterval)
  const initSignalCount = useSelector(selectReactionsSignalCount)
  const initSignalColors = useSelector(selectReactionsSignalColors)
  const initAudioSound = useSelector(selectReactionsAudioSound)
  const initAudioVolume = useSelector(selectReactionsAudioVolume)

  const [searchParams] = useSearchParams()

  // A shared link fully describes a set up, so it wins over the stored one.
  // Computed once - later edits must not be overwritten by the URL.
  const [init] = useState(() => {
    const stored = {
      rounds: initRounds,
      signalDuration: initSignalDuration,
      minInterval: initMinInterval,
      maxInterval: initMaxInterval,
      signalCount: initSignalCount,
      signalColors: initSignalColors,
      audioSound: initAudioSound,
      audioVolume: initAudioVolume,
    }

    return hasReactionsSetUp(searchParams) ? decodeReactionsSetUp(searchParams) : stored
  })

  const [rounds, setRounds, isValidRounds] = useValidatedState(init.rounds, VALIDATOR.rounds)
  const [signal, setSignal, isValidSignal] = useValidatedState(init.signalDuration, VALIDATOR.signalDuration)
  const [minInterval, setMinInterval, isValidMinInterval] = useValidatedState(init.minInterval, VALIDATOR.minInterval)
  const [maxInterval, setMaxInterval, isValidMaxInterval] = useValidatedState(init.maxInterval, VALIDATOR.maxInterval)
  const [isValidIntervalRange, setIsValidIntervalRange] = useState(init.minInterval <= init.maxInterval)
  const [signalCount, setSignalCount] = useState(init.signalCount)
  const [signalColors, setSignalColors] = useState(init.signalColors)
  const [audioSound, setAudioSound] = useState(init.audioSound)
  const [audioVolume, setAudioVolume] = useState(init.audioVolume)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleMinIntervalChange = useCallback((newValue: number) => {
    setMinInterval(newValue)
    setIsValidIntervalRange(newValue <= maxInterval)
  }, [maxInterval, setMinInterval, setIsValidIntervalRange])

  const handleMaxIntervalChange = useCallback((newValue: number) => {
    setMaxInterval(newValue)
    setIsValidIntervalRange(newValue >= minInterval)
  }, [minInterval, setMaxInterval, setIsValidIntervalRange])

  const handleSignalColorChange = useCallback((newValue: string, index: number) => {
    setSignalColors(prevColors => {
      const newColors = [...prevColors]
      newColors[index] = newValue
      return newColors
    })
  }, [setSignalColors])

  const handleStart = useCallback(() => {
    dispatch(setReactions(rounds, signal, minInterval, maxInterval, signalCount, signalColors, audioSound, audioVolume))
    void navigate('/reactions')
  }, [dispatch, rounds, signal, minInterval, maxInterval, signalCount, signalColors, audioSound, audioVolume])

  const shareParams = useMemo(() => encodeReactionsSetUp({
    rounds,
    signalDuration: signal,
    minInterval,
    maxInterval,
    signalCount,
    signalColors,
    audioSound,
    audioVolume,
  }), [rounds, signal, minInterval, maxInterval, signalCount, signalColors, audioSound, audioVolume])

  const buildShareUrl = useCallback(() => buildAppUrl(REACTIONS_SET_UP_PATH, shareParams), [shareParams])

  // the link stops describing the screen as soon as anything is edited
  useClearUrlOnEdit(shareParams)

  const handleBack = useCallback(() => {
    dispatch(setNotActualReactions())
    void navigate('/')
  }, [dispatch])

  useEffect(() => {
    preloadBeep(init.audioSound)
  }, [])

  const { reactions: { setUpScreen: t } } = translation

  return (
    <main className='set-up-reactions'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.rounds.label}:</label>
          <NumberInput
            className='set-up-input'
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.rounds.error, LIMITS.rounds.min, LIMITS.rounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.signalDuration.label}:</label>
          <NumberInput
            className='set-up-input'
            value={signal}
            onChange={setSignal}
            invalid={!isValidSignal}
            errorMessage={insertWords(t.signalDuration.error, LIMITS.signalDuration.min, LIMITS.signalDuration.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.minInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={minInterval}
            onChange={handleMinIntervalChange}
            invalid={!isValidMinInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.minInterval.error, LIMITS.minInterval.min, LIMITS.minInterval.max), isValidMinInterval],
              [t.minInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.maxInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={maxInterval}
            onChange={handleMaxIntervalChange}
            invalid={!isValidMaxInterval || !isValidIntervalRange}
            errorMessage={joinErrorMessages([
              [insertWords(t.maxInterval.error, LIMITS.maxInterval.min, LIMITS.maxInterval.max), isValidMaxInterval],
              [t.maxInterval.rangeError, isValidIntervalRange],
            ])}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.signalCount.label}:</label>
          <CounterInput
            minusBtnClassName='set-up-signal-count-cnt-btn'
            plusBtnClassName='set-up-signal-count-cnt-btn'
            value={signalCount}
            onChange={setSignalCount}
            min={LIMITS.signalCount.min}
            max={LIMITS.signalCount.max}
          />
        </li>

        {signalColors.slice(0, signalCount).map((color, i) => (
          <li key={i} className='set-up-item'>
            <label>{`${t.signalColor.label} ${i + 1}:`}</label>
            <Input
              type='color'
              className='set-up-input'
              value={color}
              onChange={color => handleSignalColorChange(color, i)}
            />
          </li>
        ))}

        <li className='set-up-item'>
          <SoundSelect
            sound={audioSound}
            volume={audioVolume}
            onSoundChange={setAudioSound}
            onVolumeChange={setAudioVolume}
          />
        </li>
      </ul>

      <div className='buttons'>
        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={
            !isValidRounds || !isValidSignal || !isValidMinInterval
            || !isValidMaxInterval || !isValidIntervalRange
          }
        >
          {translation.common.start}
        </Button>

        <ShareButton
          buildUrl={buildShareUrl}
          disabled={
            !isValidRounds || !isValidSignal || !isValidMinInterval
            || !isValidMaxInterval || !isValidIntervalRange
          }
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
