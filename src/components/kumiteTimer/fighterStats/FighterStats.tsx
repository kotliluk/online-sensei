// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './FighterStats.scss'
import { Fouls } from '../fouls/Fouls'


interface FighterStatsProps {
  className?: string
  isRed: boolean
  score: number
  foulsOne: number
  foulsTwo: number
  onFoulsOneChange: (fouls: number) => void
  onFoulsTwoChange: (fouls: number) => void
}

export const FighterStats = (props: FighterStatsProps): JSX.Element | null => {
  const {
    className, isRed, score, foulsOne, foulsTwo,
    onFoulsOneChange, onFoulsTwoChange,
  } = props

  // TODO - score component
  return (
    <section className={`fighter-stats ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <span className='score'>{score}</span>
      <Fouls isRed={isRed} fouls={foulsOne} onChange={onFoulsOneChange} />
      <Fouls isRed={isRed} fouls={foulsTwo} onChange={onFoulsTwoChange} />
    </section>
  )
}
