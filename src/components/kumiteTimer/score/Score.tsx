// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './Score.scss'
import { Button } from '../../atoms/button/Button'
import { emptyFunc } from '../../../utils/function'


interface ScoreProps {
  className?: string
  isRed: boolean
  score: number
  isMirror: boolean
  onChange?: (score: number) => void
}

export const Score = ({
  className,
  isRed,
  score,
  isMirror,
  onChange = emptyFunc,
}: ScoreProps): JSX.Element | null => {

  // TODO - use __ prefixes constantly
  return (
    <div className={`__score ${isRed ? '__red' : '__blue'} ${className ?? ''}`}>
      <span className={`__score__value ${isMirror ? '__mirror' : ''}`}>{score}</span>

      {!isMirror && (
        <div className='__score__btns'>
          <Button className='__score__btn' onClick={() => onChange(0)}>0</Button>
          <Button className='__score__btn' onClick={() => onChange(score - 1)}>-</Button>
          <Button className='__score__btn' onClick={() => onChange(score + 1)}>+</Button>
        </div>
      )}
    </div>
  )
}
