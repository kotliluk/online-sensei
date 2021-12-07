// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
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
  redOnLeft: boolean
  senchu: Senchu
  timeButtonsDisabled: boolean
  onTimeChange: (time: number) => void
  onTimeReset: () => void
  onSwitchSides: () => void
  onSenchuChange: (senchu: Senchu) => void
}

export const FightStats = (props: FightStatsProps): JSX.Element | null => {
  const {
    className, time, redOnLeft, senchu, timeButtonsDisabled,
    onTimeChange, onTimeReset, onSwitchSides, onSenchuChange,
  } = props

  const { common: ct, kumiteTimer: t } = useSelector(selectTranslation)

  const renderCheckBox = useCallback((color: 'RED' | 'BLUE') => (
    <CheckBox
      className={`senchu-${color.toLowerCase()}`}
      checked={senchu === color}
      onChange={() => onSenchuChange(color)}
    />
  ), [senchu, onSenchuChange])

  return (
    <div className={`__fight-stats ${className ?? ''}`}>
      <span className='__fight-stats__time'>{parseTimeFromSeconds(time)}</span>

      <div className='__fight-stats__time-btns'>
        <Button className='__time-btn __reset-btn' onClick={() => onTimeReset()} disabled={timeButtonsDisabled}>
          {`${ct.reset} ${ct.time.toLowerCase()}`}
        </Button>
        <Button className='__time-btn' onClick={() => onTimeChange(time - 1)} disabled={timeButtonsDisabled}>
          -
        </Button>
        <Button className='__time-btn' onClick={() => onTimeChange(time + 1)} disabled={timeButtonsDisabled}>
          +
        </Button>
      </div>

      <div className='__fight-stats__senchu'>
        {redOnLeft ? renderCheckBox('RED') : renderCheckBox('BLUE')}
        <span className='__senchu-text'>Senchu</span>
        {redOnLeft ? renderCheckBox('BLUE') : renderCheckBox('RED')}
      </div>

      <div className='__fight-stats__settings'>
        <Button className='__switch-sides-btn' onClick={onSwitchSides} disabled={timeButtonsDisabled}>
          {t.playScreen.switchSides}
        </Button>
      </div>
    </div>
  )
}
