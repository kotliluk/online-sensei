// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './FighterStats.scss'
import { Fouls } from '../fouls/Fouls'
import { Score } from '../score/Score'
import { emptyFunc } from '../../../utils/function'


interface FighterStatsProps {
  className?: string
  isRed: boolean
  score: number
  fouls: number
  isMirror: boolean
  onScoreChange?: (score: number) => void
  onFoulsChange?: (fouls: number) => void
}

export const FighterStats = ({
  className,
  isRed,
  score,
  fouls,
  isMirror,
  onScoreChange = emptyFunc,
  onFoulsChange = emptyFunc,
}: FighterStatsProps): JSX.Element | null => {

  return (
    <section className={`__fighter-stats ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <Score isRed={isRed} score={score} isMirror={isMirror} onChange={onScoreChange} />
      <Fouls isRed={isRed} fouls={fouls} onChange={onFoulsChange} />
    </section>
  )
}
