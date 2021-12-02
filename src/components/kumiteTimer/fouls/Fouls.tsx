// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './Fouls.scss'
import { Button } from '../../atoms/button/Button'


interface FighterStatsProps {
  className?: string
  isRed: boolean
  fouls: number
  onChange: (fouls: number) => void
}

export const Fouls = (props: FighterStatsProps): JSX.Element | null => {
  const { className, isRed, fouls, onChange } = props

  return (
    <div className={`fouls ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <Button className='fouls__btn' onClick={() => onChange(fouls - 1)}>
        <span className='fouls__btn__text'>-</span>
      </Button>
      <div className={`foul-circle ${fouls >= 1 ? 'checked' : ''}`} />
      <div className={`foul-circle ${fouls >= 2 ? 'checked' : ''}`} />
      <div className={`foul-circle ${fouls >= 3 ? 'checked' : ''}`} />
      <div className={`foul-circle ${fouls >= 4 ? 'checked' : ''}`} />
      <Button className='fouls__btn' onClick={() => onChange(fouls + 1)}>
        <span className='fouls__btn__text'>+</span>
      </Button>
    </div>
  )
}
