// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './TournamentScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import {
  selectKumiteTimerCompetitors, selectKumiteTimerTournamentGroup,
} from '../../../redux/kumiteTimer/selector'
import { GroupTableCell } from './GroupTableCell'


export const GroupTournamentScreen = (): JSX.Element => {
  const competitors = useSelector(selectKumiteTimerCompetitors)
  const group = useSelector(selectKumiteTimerTournamentGroup)

  return (
    <table className='group-table'>
      <tbody>
        <tr>
          <td className='group-table-cell' />
          {competitors.map((competitor) => (
            <td className='group-table-cell' key={`top-name-${competitor.uuid}`}>{competitor.name}</td>)
          )}
        </tr>
        {group.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            <td className='group-table-cell'>{row[0].redName}</td>
            {row.map((fight, columnIndex) => (
              <GroupTableCell
                key={`cell-${rowIndex}-${columnIndex}`}
                fight={fight}
                row={rowIndex}
                column={columnIndex}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
