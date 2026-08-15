import { JSX, useCallback, useMemo, useState } from 'react'
import './SetUpScreenSimple.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { Select } from '../../atoms/select/Select'
import { VolumeInput } from '../../atoms/input/VolumeInput'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'
import {
  selectIntervalTimerAudioSound,
  selectIntervalTimerAudioVolume,
  selectIntervalTimerSimplePause,
  selectIntervalTimerSimpleRounds,
  selectIntervalTimerSimpleWork, selectIntervalTimerSkipLastPause,
} from '../../../redux/intervalTimer/selector'
import { LIMITS, VALIDATOR } from '../../../redux/intervalTimer/utils'
import { setIntervalTimerSimple, setNotActualIntervalTimer } from '../../../redux/intervalTimer/actions'
import { BEEP_A, BeepType, getBeepName, NO_BEEP } from '../../../types/beepType'
import { preloadBeep } from '../../../logic/audio/beep'
import { ShareButton } from '../../common/shareButton/ShareButton'
import { buildAppUrl } from '../../../logic/urlState/appUrl'
import {
  decodeIntervalTimerSimpleSetUp,
  encodeIntervalTimerSimpleSetUp,
  hasIntervalTimerSimpleSetUp,
  INTERVAL_TIMER_SIMPLE_SET_UP_PATH,
} from '../../../logic/urlState/intervalTimerUrl'
import { useClearUrlOnEdit } from '../../../logic/urlState/useClearUrlOnEdit'


export const SetUpScreenSimple = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initRounds = useSelector(selectIntervalTimerSimpleRounds)
  const initWork = useSelector(selectIntervalTimerSimpleWork)
  const initPause = useSelector(selectIntervalTimerSimplePause)
  const initAudioSound = useSelector(selectIntervalTimerAudioSound)
  const initAudioVolume = useSelector(selectIntervalTimerAudioVolume)
  const initSkipLastPause = useSelector(selectIntervalTimerSkipLastPause)

  const [searchParams] = useSearchParams()

  // A shared link fully describes a set up, so it wins over the stored one.
  // Computed once - later edits must not be overwritten by the URL.
  const [init] = useState(() => {
    const stored = {
      simpleRounds: initRounds,
      simpleWork: initWork,
      simplePause: initPause,
      skipLastPause: initSkipLastPause,
      audioSound: initAudioSound,
      audioVolume: initAudioVolume,
    }

    return hasIntervalTimerSimpleSetUp(searchParams) ? decodeIntervalTimerSimpleSetUp(searchParams) : stored
  })

  const [rounds, setRounds, isValidRounds] = useValidatedState(init.simpleRounds, VALIDATOR.simpleRounds)
  const [work, setWork, isValidWork] = useValidatedState(init.simpleWork, VALIDATOR.simpleWork)
  const [pause, setPause, isValidPause] = useValidatedState(init.simplePause, VALIDATOR.simplePause)
  const [audioSound, setAudioSound] = useState(init.audioSound)
  const [audioVolume, setAudioVolume] = useState(init.audioVolume)
  const [skipLastPause, setSkipLastPause] = useState(init.skipLastPause)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleAudioChange = useCallback((newValue: string) => {
    preloadBeep(newValue as BeepType)
    setAudioSound(newValue as BeepType)
  }, [setAudioSound])

  const handleGoToAdvancedSettings = useCallback(() => {
    dispatch(setIntervalTimerSimple(rounds, work, pause, skipLastPause, audioSound, audioVolume))
    void navigate('/interval-timer/set-up-advanced')
  }, [dispatch, rounds, work, pause, skipLastPause, audioSound, audioVolume])

  const handleStart = useCallback(() => {
    dispatch(setIntervalTimerSimple(rounds, work, pause, skipLastPause, audioSound, audioVolume))
    void navigate('/interval-timer')
  }, [dispatch, rounds, work, pause, skipLastPause, audioSound, audioVolume])

  const shareParams = useMemo(() => encodeIntervalTimerSimpleSetUp({
    simpleRounds: rounds,
    simpleWork: work,
    simplePause: pause,
    skipLastPause,
    audioSound,
    audioVolume,
  }), [rounds, work, pause, skipLastPause, audioSound, audioVolume])

  const buildShareUrl = useCallback(() => buildAppUrl(INTERVAL_TIMER_SIMPLE_SET_UP_PATH, shareParams), [shareParams])

  // the link stops describing the screen as soon as anything is edited
  useClearUrlOnEdit(shareParams)

  const handleBack = useCallback(() => {
    dispatch(setNotActualIntervalTimer())
    void navigate('/')
  }, [dispatch])

  const { intervalTimer: { setUpScreenSimple: t } } = translation

  return (
    <main className='set-up-interval-timer-simple'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.rounds.label}:</label>
          <NumberInput
            className='set-up-input'
            value={rounds}
            onChange={setRounds}
            invalid={!isValidRounds}
            errorMessage={insertWords(t.rounds.error, LIMITS.simpleRounds.min, LIMITS.simpleRounds.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.workInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={work}
            onChange={setWork}
            invalid={!isValidWork}
            errorMessage={insertWords(t.workInterval.error, LIMITS.simpleWork.min, LIMITS.simpleWork.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.pauseInterval.label}:</label>
          <NumberInput
            className='set-up-input'
            value={pause}
            onChange={setPause}
            invalid={!isValidPause}
            errorMessage={insertWords(t.pauseInterval.error, LIMITS.simplePause.min, LIMITS.simplePause.max)}
          />
        </li>

        <li className='set-up-item'>
          <label>{translation.common.sound}:</label>
          <div className='set-up-volume'>
            <Select
              className='set-up-volume-select'
              selected={audioSound}
              values={[
                { value: NO_BEEP, text: translation.common.noSound },
                { value: BEEP_A, text: getBeepName(BEEP_A) },
              ]}
              onChange={handleAudioChange}
            />
            <VolumeInput
              inputClassName='set-up-volume-input'
              buttonClassName='set-up-volume-mute'
              value={audioVolume}
              onChange={setAudioVolume}
              disabled={audioSound === NO_BEEP}
            />
            {/* <Button
              className='set-up-volume-try'
              onClick={handleTryAudio}
              disabled={audioSound === NO_BEEP}
            >
              Try
            </Button> */}
          </div>
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
          className='advanced-settings-btn'
          onClick={handleGoToAdvancedSettings}
        >
          {t.advancedSettingsBtn}
        </Button>

        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isValidRounds || !isValidWork || !isValidPause}
        >
          {translation.common.start}
        </Button>

        <ShareButton
          buildUrl={buildShareUrl}
          disabled={!isValidRounds || !isValidWork || !isValidPause}
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
