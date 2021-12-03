// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './Score.scss'
import { Button } from '../../atoms/button/Button'


interface ScoreProps {
  className?: string
  isRed: boolean
  score: number
  onChange: (score: number) => void
}

export const Score = (props: ScoreProps): JSX.Element | null => {
  const { className, isRed, score, onChange } = props

  return (
    <div className={`score ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <span className='score__value'>{score}</span>
      <div className='score__btns'>
        <Button className='score__btn' onClick={() => onChange(0)}>
          <span className='score__btn__text'>0</span>
        </Button>
        <Button className='score__btn' onClick={() => onChange(score - 1)}>
          <span className='score__btn__text'>-</span>
        </Button>
        <Button className='score__btn' onClick={() => onChange(score + 1)}>
          <span className='score__btn__text'>+</span>
        </Button>
      </div>
    </div>
  )
}
