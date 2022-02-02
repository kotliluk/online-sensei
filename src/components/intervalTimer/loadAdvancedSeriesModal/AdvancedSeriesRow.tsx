// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './AdvancedSeriesRow.scss'
import { Series } from '../../../types/series'
import { Button } from '../../atoms/button/Button'
import { Cross } from '../../icons/Cross'
import { Upload } from '../../icons/Upload'


interface AdvancedSeriesRowProps {
  series: Series
  onLoad: () => void
  onDelete: () => void
}

export const AdvancedSeriesRow = (props: AdvancedSeriesRowProps): JSX.Element | null => {
  const { series, onLoad, onDelete } = props

  const workTime = series.intervals.filter((i) => i.type === 'work').reduce((agg, i) => agg + i.duration, 0)
  const pauseTime = series.intervals.filter((i) => i.type === 'pause').reduce((agg, i) => agg + i.duration, 0)

  return (
    <li className='advanced-series-row'>
      <span>{series.name}</span>
      <div>
        <span>{series.rounds}x <span className='red'>{workTime}</span>+<span className='green'>{pauseTime}</span></span>
        <Button className='load-button' onClick={onLoad}><Upload /></Button>
        <Button className='delete-button' onClick={onDelete}><Cross /></Button>
      </div>
    </li>
  )
}
