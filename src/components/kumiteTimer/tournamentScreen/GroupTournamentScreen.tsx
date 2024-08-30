// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect } from 'react'
import './TournamentScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectKumiteTimerCompetitors, selectKumiteTimerTournamentGroup,
} from '../../../redux/kumiteTimer/selector'
import { GroupTableRow } from './GroupTableRow'
import { selectTranslation } from '../../../redux/page/selector'


const FIXED_COLUMN_WIDTH = '9rem'
const FIXED_COLUMN_MAX_WIDTH = '30vw'
const FIXED_TABLE_MAX_WIDTH = '70vw'
const FIXED_ROW_HEIGHT = '3rem'
const FIXED_TABLE_MAX_HEIGHT = '50vh'

const COLUMN_WIDTH_VALUE = 3
const COLUMN_WIDTH_UNIT = 'rem'
const ROW_HEIGHT_VALUE = 3
const ROW_WIDTH_UNIT = 'rem'

export const GroupTournamentScreen = (): JSX.Element => {
  const { kumiteTimer: { setUpScreen: { tournament: { tableStatsLabels } } } } = useSelector(selectTranslation)
  const competitors = useSelector(selectKumiteTimerCompetitors)
  const group = useSelector(selectKumiteTimerTournamentGroup)

  const gridContentWidth = `${(competitors.length + 6 + 1) * COLUMN_WIDTH_VALUE}${COLUMN_WIDTH_UNIT}`
  const gridContentHeight = `${(competitors.length + 1) * ROW_HEIGHT_VALUE}${ROW_WIDTH_UNIT}`
  const contentWidth = `${(competitors.length + 6) * COLUMN_WIDTH_VALUE}${COLUMN_WIDTH_UNIT}`
  const contentHeight = `${(competitors.length) * ROW_HEIGHT_VALUE}${ROW_WIDTH_UNIT}`

  useEffect(() => {
    const wrapper = document.querySelector('.fixed-table-wrapper') as HTMLDivElement
    const content = wrapper.querySelector('.fixed-content') as HTMLDivElement
    const fixedRow = wrapper.querySelector('.fixed-row') as HTMLDivElement
    const fixedColumn = wrapper.querySelector('.fixed-column') as HTMLDivElement

    const listener = () => {
      fixedRow.scrollLeft = content.scrollLeft
      fixedColumn.scrollTop = content.scrollTop
    }

    content.addEventListener('scroll', listener)

    return () => content.removeEventListener('scroll', listener)
  }, [])

  return (
    <div
      className='fixed-table-wrapper'
      style={{
        // eslint-disable-next-line max-len
        gridTemplateColumns: `min(${FIXED_COLUMN_MAX_WIDTH}, ${FIXED_COLUMN_WIDTH}) min(${FIXED_TABLE_MAX_WIDTH}, ${gridContentWidth})`,
        gridTemplateRows: `${FIXED_ROW_HEIGHT} min(${FIXED_TABLE_MAX_HEIGHT}, ${gridContentHeight})`,
      }}
    >
      <div className='fixed-row with-scrollbar'>
        <div className='top-names-row'>
          {competitors.map((competitor) => (
            <div className='top-names-cell' key={competitor.uuid}>
              <span className='name-span'>{competitor.name}</span>
            </div>
          ))}
          <div className='top-names-cell'>{tableStatsLabels.win}</div>
          <div className='top-names-cell'>{tableStatsLabels.draw}</div>
          <div className='top-names-cell'>{tableStatsLabels.loss}</div>
          <div className='top-names-cell'>+</div>
          <div className='top-names-cell'>-</div>
          <div className='top-names-cell'>+/-</div>
        </div>
      </div>

      <div className='fixed-column with-scrollbar'>
        <div className='left-names-column'>
          {competitors.map((competitor) => (
            <div key={competitor.uuid} className='left-names-cell'>
              <span className='name-span'>{competitor.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='fixed-content with-scrollbar'>
        <div
          className='group-table'
          style={{ width: contentWidth, height: contentHeight }}
        >
          {group.map((row, rowIndex) => (
            <GroupTableRow key={rowIndex} row={row} rowIndex={rowIndex} />
          ))}
        </div>
      </div>
    </div>
  )
}
