// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './FightStats.scss'
import { Senchu } from '../utils'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { Button } from '../../atoms/button/Button'
import { parseTimeFromSeconds } from '../../../utils/time'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'


interface FightStatsProps {
  className?: string
  time: number
  senchu: Senchu
  timeButtonsDisabled: boolean
  onTimeChange: (time: number) => void
  onTimeReset: () => void
  onSenchuChange: (senchu: Senchu) => void
}

export const FightStats = (props: FightStatsProps): JSX.Element | null => {
  const { className, time, senchu, timeButtonsDisabled, onTimeChange, onTimeReset, onSenchuChange } = props

  const { common: t } = useSelector(selectTranslation)

  return (
    <div className={`__fight-stats ${className ?? ''}`}>
      <span className='fight-stats__time'>{parseTimeFromSeconds(time)}</span>

      <div className='fight-stats__btns'>
        <Button className='fight-stats__btn reset' onClick={() => onTimeReset()} disabled={timeButtonsDisabled}>
          <span className='fight-stats__btn__text'>{`${t.reset} ${t.time.toLowerCase()}`}</span>
        </Button>
        <Button className='fight-stats__btn' onClick={() => onTimeChange(time - 1)} disabled={timeButtonsDisabled}>
          <span className='fight-stats__btn__text'>-</span>
        </Button>
        <Button className='fight-stats__btn' onClick={() => onTimeChange(time + 1)} disabled={timeButtonsDisabled}>
          <span className='fight-stats__btn__text'>+</span>
        </Button>
      </div>

      <div className='fight-stats__senchu'>
        <CheckBox checked={senchu === 'RED'} onChange={() => onSenchuChange('RED')} />
        <span className='fight-stats__senchu__text'>Senchu</span>
        <CheckBox checked={senchu === 'BLUE'} onChange={() => onSenchuChange('BLUE')} />
      </div>
    </div>
  )
}
