// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect, useState } from 'react'
import './TournamentScreen.scss'
import { GroupTableCell } from './GroupTableCell'
import { Fight } from '../../../types/tournament'


interface GroupTableRowProps {
  row: Fight[]
  rowIndex: number
}

export const GroupTableRow = (props: GroupTableRowProps): JSX.Element => {
  const { row, rowIndex } = props

  const [wins, setWins] = useState(0)
  const [draws, setDraws] = useState(0)
  const [losses, setLosses] = useState(0)
  const [plusPoints, setPlusPoints] = useState(0)
  const [minusPoints, setMinusPoints] = useState(0)

  useEffect(() => {
    setWins(row.reduce((agg, fight) => agg + (fight.winner === 'RED' ? 1 : 0), 0))
    setDraws(row.reduce((agg, fight) => agg + (fight.winner === 'DRAW' ? 1 : 0), 0))
    setLosses(row.reduce((agg, fight) => agg + (fight.winner === 'BLUE' ? 1 : 0), 0))
    setPlusPoints(row.reduce((agg, fight) => agg + fight.redPoints, 0))
    setMinusPoints(row.reduce((agg, fight) => agg + fight.bluePoints, 0))
  }, [row])

  return (
    <tr>
      <td className='group-table-cell left-name'>
        <span className='name-span'>{row[0].redName}</span>
      </td>
      {row.map((fight, columnIndex) => (
        <GroupTableCell
          key={`cell-${rowIndex}-${columnIndex}`}
          fight={fight}
          row={rowIndex}
          column={columnIndex}
        />
      ))}
      <td className='group-table-cell stats-cell'>{wins}</td>
      <td className='group-table-cell stats-cell'>{draws}</td>
      <td className='group-table-cell stats-cell'>{losses}</td>
      <td className='group-table-cell stats-cell'>{plusPoints}</td>
      <td className='group-table-cell stats-cell'>{minusPoints}</td>
      <td className='group-table-cell stats-cell'>{plusPoints - minusPoints}</td>
    </tr>
  )
}
