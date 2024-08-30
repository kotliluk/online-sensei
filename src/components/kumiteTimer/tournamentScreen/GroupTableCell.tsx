// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import './TournamentScreen.scss'
import { Fight } from '../../../types/tournament'
import { useDispatch } from '../../../redux/useDispatch'
import { setTournamentFight } from '../../../redux/kumiteTimer/actions'


interface GroupTableCellProps {
  fight: Fight
  row: number
  column: number
}

export const GroupTableCell = (props: GroupTableCellProps): JSX.Element | null => {
  const { fight, row, column } = props

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClick = useCallback(() => {
    if (row < column) {
      dispatch(setTournamentFight(fight))
      history.push('/kumite-timer')
    }
  }, [fight, row, column])

  if (fight.redUuid === fight.blueUuid) {
    return <div className='group-table-cell diagonal' />
  }

  if (fight.winner === undefined) {
    return (
      <div
        className={`group-table-cell ${row < column ? 'upper' : 'lower'}`}
        onClick={handleClick}
      >
        <span>-</span>
      </div>
    )
  }

  return (
    <div
      className={`group-table-cell ${row < column ? 'upper' : 'lower'}`}
      onClick={handleClick}
    >
      <span className={fight.winner === 'RED' ? 'winner-score' : ''}>{fight.redPoints}</span>
      &nbsp;:&nbsp;
      <span className={fight.winner === 'BLUE' ? 'winner-score' : ''}>{fight.bluePoints}</span>
    </div>
  )
}
