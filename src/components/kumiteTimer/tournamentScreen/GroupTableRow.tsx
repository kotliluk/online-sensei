import { JSX } from 'react'
import './TournamentScreen.scss'
import { GroupTableCell } from './GroupTableCell'
import { Fight, groupRowStats } from '../../../types/tournament'


interface GroupTableRowProps {
  row: Fight[]
  rowIndex: number
}

export const GroupTableRow = (props: GroupTableRowProps): JSX.Element => {
  const { row, rowIndex } = props

  // derived, not stored: these are a function of the row and nothing else, and
  // the exported overview works them out with the same call
  const { wins, draws, losses, plusPoints, minusPoints } = groupRowStats(row)

  return (
    <div className='group-table-row'>
      {row.map((fight, columnIndex) => (
        <GroupTableCell
          key={`cell-${rowIndex}-${columnIndex}`}
          fight={fight}
          row={rowIndex}
          column={columnIndex}
        />
      ))}
      <div className='group-table-cell stats-cell'>{wins}</div>
      <div className='group-table-cell stats-cell'>{draws}</div>
      <div className='group-table-cell stats-cell'>{losses}</div>
      <div className='group-table-cell stats-cell'>{plusPoints}</div>
      <div className='group-table-cell stats-cell'>{minusPoints}</div>
      <div className='group-table-cell stats-cell'>{plusPoints - minusPoints}</div>
    </div>
  )
}
