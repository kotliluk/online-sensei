// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Fouls.scss'


interface FoulsProps {
  className?: string
  isRed: boolean
  fouls: number
  onChange: (fouls: number) => void
}

export const Fouls = (props: FoulsProps): JSX.Element | null => {
  const { className, isRed, fouls, onChange } = props

  const handleChange = useCallback((newFouls: number) => {
    if (newFouls === fouls) {
      onChange(fouls - 1)
    } else {
      onChange(newFouls)
    }
  }, [fouls, onChange])

  return (
    <div className={`__fouls ${isRed ? 'red' : 'blue'} ${className ?? ''}`}>
      <div className={`foul-circle ${fouls >= 1 ? 'checked' : ''}`} onClick={() => handleChange(1)} />
      <div className={`foul-circle ${fouls >= 2 ? 'checked' : ''}`} onClick={() => handleChange(2)} />
      <div className={`foul-circle ${fouls >= 3 ? 'checked' : ''}`} onClick={() => handleChange(3)} />
      <div className={`foul-circle ${fouls >= 4 ? 'checked' : ''}`} onClick={() => handleChange(4)} />
      <div className={`foul-circle ${fouls >= 5 ? 'checked' : ''}`} onClick={() => handleChange(5)} />
    </div>
  )
}
