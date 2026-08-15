import { JSX, useCallback, useEffect, useState } from 'react'
import './Results.scss'
import { useSelector } from '../../../redux/useSelector'
import { Button } from '../../atoms/button/Button'
import { selectTranslation } from '../../../redux/page/selector'
import { Competitor, CompetitorWithPlace, newCompetitorWithPlace } from '../../../types/groupStopwatch'
import { OrderArrow } from '../../icons/OrderArrow'
import { buildCsv, CSV_MIME_TYPE } from '../../../utils/csv'
import { exportFile, willShareFile } from '../../../logic/download/exportFile'


const NULL_TIME_REPLACE = 365 * 24 * 60 * 60 * 1000

const pad = (value: number): string => value.toString().padStart(2, '0')

/** Local time, so the name matches the clock of whoever exports the file. */
const csvFileName = (): string => {
  const now = new Date()

  return `group-stopwatch-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    + `-${pad(now.getHours())}${pad(now.getMinutes())}.csv`
}

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
  const { groupStopwatch: { playScreen: t }, common: ct } = translation

  const [competitorsWithPlace, setCompetitorsWithPlace] = useState<CompetitorWithPlace[]>([])
  const [competitorsToShow, setCompetitorsToShow] = useState<CompetitorWithPlace[]>([])
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'place'>('place')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  // the button says what it does, and that depends on the device, not on the results
  const [shares] = useState(() => willShareFile(CSV_MIME_TYPE))

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

  // the rows are taken as they are shown, so the file keeps the chosen sorting
  const handleExportCsv = useCallback(() => {
    const rows = [
      ['#', t.name, t.time, t.place],
      ...competitorsToShow.map((c) => [String(c.id), c.name, c.timeString, String(c.place)]),
    ]

    exportFile(new File([buildCsv(rows)], csvFileName(), { type: CSV_MIME_TYPE }))
  }, [competitorsToShow, t])

  return (
    <div className='results-group-stopwatch-wrapper'>
      <div className='results-group-stopwatch-competitors'>
        <table>
          <thead>
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
          </thead>
          <tbody>
            {competitorsToShow.map((competitor) => (
              <tr
                className='competitor-row'
                key={competitor.id}
              >
                <td
                  className='competitor-id'
                  style={{ backgroundColor: competitor.color, color: competitor.contrastColor }}
                >
                  {competitor.id}
                </td>
                <td className='competitor-name'>{competitor.name}</td>
                <td className='competitor-time'>{competitor.timeString}</td>
                <td className='competitor-place'>{competitor.place}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='buttons'>
        <Button
          className='orange export-btn'
          onClick={handleExportCsv}
        >
          {shares ? ct.shareCsv : ct.downloadCsv}
        </Button>
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
