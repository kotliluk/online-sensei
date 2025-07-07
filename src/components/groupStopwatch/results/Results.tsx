// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import './Results.scss'
import { useSelector } from '../../../redux/useSelector'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import { Competitor, CompetitorWithPlace, newCompetitorWithPlace } from '../../../types/groupStopwatch'
import { OrderArrow } from '../../icons/OrderArrow'


const NULL_TIME_REPLACE = 365 * 24 * 60 * 60 * 1000

const compareOrById = (primaryResult: number, a: CompetitorWithPlace, b: CompetitorWithPlace): number => {
  if (primaryResult === 0) {
    return a.id - b.id
  }
  return primaryResult
}

interface ResultsProps {
  competitors: Competitor[]
  onBackToStopwatch: () => void
}

export const Results = (props: ResultsProps): JSX.Element | null => {
  const { competitors, onBackToStopwatch } = props
  const translation = useSelector(selectTranslation)

  const [competitorsWithPlace, setCompetitorsWithPlace] = useState<CompetitorWithPlace[]>([])
  const [competitorsToShow, setCompetitorsToShow] = useState<CompetitorWithPlace[]>([])
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'place'>('place')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const newCompetitors = competitors.map((c, i) => newCompetitorWithPlace(c, i, NULL_TIME_REPLACE))
    // sorts competitors
    newCompetitors.sort((a, b) => a.time - b.time)
    // adds their places - draw with previous competitor when times are equal
    newCompetitors.forEach((c, i, arr) => {
      c.place = i + 1
      if (i > 0 && c.time === arr[i - 1].time) {
        c.place = arr[i - 1].place
      }
    })
    setCompetitorsWithPlace(newCompetitors)
  }, [competitors, setCompetitorsWithPlace])

  useEffect(() => {
    const copy = [...competitorsWithPlace]
    const orderMultiplicator = order === 'asc' ? 1 : -1
    if (sortBy === 'id') {
      setCompetitorsToShow(copy.sort((a, b) => compareOrById(0, a, b) * orderMultiplicator))
    }
    if (sortBy === 'name') {
      setCompetitorsToShow(copy.sort((a, b) => compareOrById(a.name.localeCompare(b.name), a, b) * orderMultiplicator))
    }
    if (sortBy === 'place') {
      setCompetitorsToShow(copy.sort((a, b) => compareOrById(a.place - b.place, a, b) * orderMultiplicator))
    }
  }, [competitorsWithPlace, sortBy, order, setCompetitorsToShow])

  const handleChangeSort = useCallback((newSortBy: 'id' | 'name' | 'place') => {
    setSortBy(newSortBy)
    setOrder(prevOrder => newSortBy === sortBy ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'asc')
  }, [sortBy, setSortBy, setOrder])

  const { groupStopwatch: { playScreen: t }, common: ct } = translation

  return (
    <div className='results-group-stopwatch-wrapper'>
      <table className='results-group-stopwatch-competitors'>
        <tr>
          <th className='competitor-id' onClick={() => handleChangeSort('id')}>
            # {sortBy === 'id' && (<OrderArrow order={order} />)}
          </th>
          <th className='competitor-name' onClick={() => handleChangeSort('name')}>
            {t.name} {sortBy === 'name' && (<OrderArrow order={order} />)}
          </th>
          <th className='competitor-time' onClick={() => handleChangeSort('place')}>
            {t.time} {sortBy === 'place' && (<OrderArrow order={order} />)}
          </th>
          <th className='competitor-place' onClick={() => handleChangeSort('place')}>
            {t.place} {sortBy === 'place' && (<OrderArrow order={order} />)}
          </th>
        </tr>
        {competitorsToShow.map((competitor) => (
          <tr
            className='competitor-row'
            key={competitor.id}
          >
            <td className='competitor-id cell'>{competitor.id}</td>
            <td className='competitor-name'>{competitor.name}</td>
            <td className='competitor-time'>{competitor.timeString}</td>
            <td className='competitor-place'>{competitor.place}</td>
          </tr>
        ))}
      </table>

      <div className='buttons'>
        <Button
          className='orange'
          onClick={onBackToStopwatch}
        >
          {ct.back}
        </Button>
      </div>
    </div>
  )
}
