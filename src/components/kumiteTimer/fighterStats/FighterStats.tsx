// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './FighterStats.scss'
import { Fouls } from '../fouls/Fouls'
import { Score } from '../score/Score'


interface FighterStatsProps {
  className?: string
  isRed: boolean
  score: number
  foulsOne: number
  foulsTwo: number
  onScoreChange: (score: number) => void
  onFoulsOneChange: (fouls: number) => void
  onFoulsTwoChange: (fouls: number) => void
}

export const FighterStats = (props: FighterStatsProps): JSX.Element | null => {
  const {
    className, isRed, score, foulsOne, foulsTwo,
    onScoreChange, onFoulsOneChange, onFoulsTwoChange,
  } = props

  return (
    <section className={`__fighter-stats ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <Score isRed={isRed} score={score} onChange={onScoreChange} />
      <Fouls isRed={isRed} fouls={foulsOne} onChange={onFoulsOneChange} />
      <Fouls isRed={isRed} fouls={foulsTwo} onChange={onFoulsTwoChange} />
    </section>
  )
}
