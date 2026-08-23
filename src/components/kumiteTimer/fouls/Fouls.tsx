import { JSX, useCallback } from 'react'
import './Fouls.scss'


interface FoulsProps {
  className?: string
  isRed: boolean
  fouls: number
  /** A mirror is a display for the hall, so its circles answer to nobody. */
  isMirror: boolean
  onChange: (fouls: number) => void
}

export const Fouls = (props: FoulsProps): JSX.Element | null => {
  const { className, isRed, fouls, isMirror, onChange } = props

  const handleChange = useCallback((newFouls: number) => {
    if (newFouls === fouls) {
      onChange(fouls - 1)
    } else {
      onChange(newFouls)
    }
  }, [fouls, onChange])

  return (
    <div className={`__fouls ${isRed ? 'red' : 'blue'} ${isMirror ? '__mirror' : ''} ${className ?? ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`foul-circle ${fouls >= n ? 'checked' : ''}`}
          onClick={isMirror ? undefined : () => handleChange(n)}
        />
      ))}
    </div>
  )
}
