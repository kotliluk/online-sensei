// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './TournamentScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectKumiteTimerCompetitors, selectKumiteTimerTournamentGroup,
} from '../../../redux/kumiteTimer/selector'
import { GroupTableRow } from './GroupTableRow'
import { selectTranslation } from '../../../redux/page/selector'


export const GroupTournamentScreen = (): JSX.Element => {
  const { kumiteTimer: { setUpScreen: { tournament: { tableStatsLabels } } } } = useSelector(selectTranslation)
  const competitors = useSelector(selectKumiteTimerCompetitors)
  const group = useSelector(selectKumiteTimerTournamentGroup)

  return (
    <table className='group-table'>
      <tbody>
        <tr>
          <td className='group-table-cell left-name' />
          {competitors.map((competitor) => (
            <td className='group-table-cell top-name' key={`top-name-${competitor.uuid}`}>
              <span className='name-span'>{competitor.name}</span>
            </td>)
          )}
          <td className='group-table-cell'>{tableStatsLabels.win}</td>
          <td className='group-table-cell'>{tableStatsLabels.draw}</td>
          <td className='group-table-cell'>{tableStatsLabels.loss}</td>
          <td className='group-table-cell'>+</td>
          <td className='group-table-cell'>-</td>
          <td className='group-table-cell'>+/-</td>
        </tr>
        {group.map((row, rowIndex) => (
          <GroupTableRow key={rowIndex} row={row} rowIndex={rowIndex} />
        ))}
      </tbody>
    </table>
  )
}
