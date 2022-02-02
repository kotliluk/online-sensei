// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import './SaveAdvancedSeries.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import {
  selectIntervalTimerAdvancedRoundIntervals,
  selectIntervalTimerAdvancedRounds,
  selectIntervalTimerAdvancedSavedSeries,
  selectIntervalTimerAudioSound,
  selectIntervalTimerAudioVolume,
  selectIntervalTimerSkipLastPause,
} from '../../../redux/intervalTimer/selector'
import { saveAdvancedSeries } from '../../../redux/intervalTimer/actions'
import { selectTranslation } from '../../../redux/page/selector'
import { Input } from '../../atoms/input/Input'
import useValidatedState from '../../../logic/hooks/useValidatedState'


export const SaveAdvancedSeries = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { intervalTimer: { setUpScreenAdvanced: t } } = translation

  const dispatch = useDispatch()
  const close = useCloseModal()

  const savedSeries = useSelector(selectIntervalTimerAdvancedSavedSeries)
  const intervals = useSelector(selectIntervalTimerAdvancedRoundIntervals)
  const rounds = useSelector(selectIntervalTimerAdvancedRounds)
  const audioSound = useSelector(selectIntervalTimerAudioSound)
  const audioVolume = useSelector(selectIntervalTimerAudioVolume)
  const skipLastPause = useSelector(selectIntervalTimerSkipLastPause)
  const [name, setName, isValidName] = useValidatedState('', (x) => savedSeries.every(s => s.name !== x))

  const handleSeriesSave = useCallback(() => {
    dispatch(saveAdvancedSeries({ name, intervals, rounds, audioSound, audioVolume, skipLastPause }))
    close()
  }, [dispatch, name, intervals, rounds, audioSound, audioVolume, skipLastPause])

  // TODO - styling
  return (
    <div className='load-advanced-series'>
      <ModalHeader heading={t.saveSeries} />
      <div className='body'>
        <Input
          type='text'
          value={name}
          onChange={setName}
          invalid={!isValidName}
          errorMessage={t.duplicateSeriesNameError}
        />
        <Button
          className='save-button'
          onClick={handleSeriesSave}
          disabled={!isValidName}
        >
          {t.saveSeries}
        </Button>
        <Button
          className='cancel-button'
          onClick={close}
        >
          {translation.common.back}
        </Button>
      </div>
    </div>
  )
}
