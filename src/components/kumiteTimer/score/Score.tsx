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

  return (
    <div className={`__score ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <span className='score__value'>{score}</span>

      {!isMirror && (
        <div className='score__btns'>
          <Button className='score__btn' onClick={() => onChange(0)}>0</Button>
          <Button className='score__btn' onClick={() => onChange(score - 1)}>-</Button>
          <Button className='score__btn' onClick={() => onChange(score + 1)}>+</Button>
        </div>
      )}
    </div>
  )
}
