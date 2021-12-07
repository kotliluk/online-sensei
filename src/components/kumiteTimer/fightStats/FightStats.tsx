// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './FightStats.scss'
import { Senchu } from '../utils'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { Button } from '../../atoms/button/Button'
import { parseTimeFromSeconds } from '../../../utils/time'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { config } from '../../../config'
import { emptyFunc } from '../../../utils/function'


interface FightStatsProps {
  className?: string
  time: number
  redOnLeft: boolean
  senchu: Senchu
  isMirror: boolean
  timeButtonsDisabled?: boolean
  onTimeChange?: (time: number) => void
  onTimeReset?: () => void
  onSenchuChange?: (senchu: Senchu) => void
  onSwitchSides: () => void
}

export const FightStats = ({
  className,
  time,
  redOnLeft,
  senchu,
  isMirror,
  timeButtonsDisabled = true,
  onTimeChange = emptyFunc,
  onTimeReset = emptyFunc,
  onSenchuChange = emptyFunc,
  onSwitchSides,
}: FightStatsProps): JSX.Element | null => {

  const openMirrorWindow = useCallback(() => {
    console.log(window.location.origin)
    window.open(window.location.origin + config.basename + '?mirror=true', '_blank')
  }, [])

  const renderCheckBox = useCallback((color: 'RED' | 'BLUE') => (
    <CheckBox
      className={`senchu-${color.toLowerCase()}`}
      checked={senchu === color}
      onChange={() => onSenchuChange(color)}
    />
  ), [senchu, onSenchuChange])

  const { common: ct, kumiteTimer: t } = useSelector(selectTranslation)

  return (
    <div className={`__fight-stats ${className ?? ''}`}>
      <span className='__fight-stats__time'>{parseTimeFromSeconds(time)}</span>

      {!isMirror && (
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
      )}

      <div className='__fight-stats__senchu'>
        {redOnLeft ? renderCheckBox('RED') : renderCheckBox('BLUE')}
        <span className='__senchu-text'>Senchu</span>
        {redOnLeft ? renderCheckBox('BLUE') : renderCheckBox('RED')}
      </div>

      <div className='__fight-stats__settings'>
        <Button className='__switch-sides-btn' onClick={onSwitchSides} disabled={timeButtonsDisabled && !isMirror}>
          {t.playScreen.switchSides}
        </Button>

        {!isMirror && (
          <Button className='__open-mirror-btn' onClick={openMirrorWindow} disabled={timeButtonsDisabled}>
            [_][_]
          </Button>
        )}
      </div>
    </div>
  )
}
