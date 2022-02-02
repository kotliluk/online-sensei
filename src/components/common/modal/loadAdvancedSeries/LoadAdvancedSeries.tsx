// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import './LoadAdvancedSeries.scss'
import { ModalHeader } from '../modalHeader/ModalHeader'
import { useCloseModal } from '../../../../hooks/useCloseModal'
import { Button } from '../../../atoms/button/Button'
import { useDispatch } from '../../../../redux/useDispatch'
import { selectIntervalTimerAdvancedSavedSeries } from '../../../../redux/intervalTimer/selector'
import { AdvancedSeriesRow } from './AdvancedSeriesRow'
import { Series } from '../../../../types/series'
import { loadAdvancedSeries } from '../../../../redux/intervalTimer/actions'


export const LoadAdvancedSeries = (): JSX.Element | null => {
  const dispatch = useDispatch()
  const close = useCloseModal()

  const savedSeries = useSelector(selectIntervalTimerAdvancedSavedSeries)

  const handleSeriesLoad = useCallback((series: Series) => {
    dispatch(loadAdvancedSeries(series))
    close()
  }, [dispatch])

  const handleSeriesDelete = useCallback((i: number) => {
    // TODO
  }, [dispatch])

  return (
    <div className='load-advanced-series'>
      <ModalHeader heading={'Load'/* TODO */} />
      <div className='body'>
        {(savedSeries.length === 0)
          ? <span className='no-series-span'>NO SERIES{/* TODO */}</span>
          : <ul className='series-rows'>{savedSeries.map((series, i) => (
            <AdvancedSeriesRow
              key={i}
              series={series}
              onLoad={() => handleSeriesLoad(series)}
              onDelete={() => handleSeriesDelete(i)}
            />
          ))}</ul>
        }
        <Button className='cancel-button' onClick={close}>Zrušit{/* TODO */}</Button>
      </div>
    </div>
  )
}
