// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import './LoadAdvancedSeries.scss'
import { ModalHeader } from '../../common/modal/modalHeader/ModalHeader'
import { useCloseModal } from '../../../hooks/useCloseModal'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { selectIntervalTimerAdvancedSavedSeries } from '../../../redux/intervalTimer/selector'
import { AdvancedSeriesRow } from './AdvancedSeriesRow'
import { Series } from '../../../types/series'
import { deleteSavedAdvancedSeries, loadAdvancedSeries } from '../../../redux/intervalTimer/actions'
import { selectTranslation } from '../../../redux/page/selector'


export const LoadAdvancedSeries = (): JSX.Element | null => {
  const translation = useSelector(selectTranslation)
  const { intervalTimer: { setUpScreenAdvanced: { loadSeriesModal: t } } } = translation

  const dispatch = useDispatch()
  const close = useCloseModal()

  const savedSeries = useSelector(selectIntervalTimerAdvancedSavedSeries)

  const handleSeriesLoad = useCallback((series: Series) => {
    dispatch(loadAdvancedSeries(series))
    close()
  }, [dispatch])

  const handleSeriesDelete = useCallback((i: number) => {
    dispatch(deleteSavedAdvancedSeries(i))
  }, [dispatch])

  // TODO - scroll when too many
  return (
    <div className='load-advanced-series'>
      <ModalHeader heading={t.heading} />
      <div className='body'>
        {(savedSeries.length === 0)
          ? <span className='no-series-span'>{t.noSeries}</span>
          : <ul className='series-rows'>{savedSeries.map((series, i) => (
            <AdvancedSeriesRow
              key={i}
              series={series}
              onLoad={() => handleSeriesLoad(series)}
              onDelete={() => handleSeriesDelete(i)}
            />
          ))}</ul>
        }
        <Button className='cancel-button' onClick={close}>{translation.common.back}</Button>
      </div>
    </div>
  )
}
