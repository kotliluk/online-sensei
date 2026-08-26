import { JSX, useCallback } from 'react'
import './Fouls.scss'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { insertWords } from '../../../logic/translation'


interface FoulsProps {
  className?: string
  isRed: boolean
  fouls: number
  /** A mirror is a display for the hall, so its circles answer to nobody. */
  isMirror: boolean
  onChange: (fouls: number) => void
}

const CIRCLES = [1, 2, 3, 4, 5]

export const Fouls = (props: FoulsProps): JSX.Element | null => {
  const { className, isRed, fouls, isMirror, onChange } = props
  const { kumiteTimer: { timerScreen: t } } = useSelector(selectTranslation)

  const handleChange = useCallback((newFouls: number) => {
    if (newFouls === fouls) {
      onChange(fouls - 1)
    } else {
      onChange(newFouls)
    }
  }, [fouls, onChange])

  return (
    <div
      className={`__fouls ${isRed ? 'red' : 'blue'} ${isMirror ? '__mirror' : ''} ${className ?? ''}`}
      // a wall in a hall holds no controls, so it announces none either - five buttons
      // read out on a display nobody can reach is noise, not access
      aria-hidden={isMirror ? true : undefined}
    >
      {CIRCLES.map((n) => {
        const circleClass = `foul-circle ${fouls >= n ? 'checked' : ''}`

        // A button and not a div: these were the only controls on the screen the tab order
        // skipped, so at a table with a laptop and no touchscreen a foul could not be given
        // at all - and the fifth one hands the fight to the other corner.
        return isMirror
          ? <div key={n} className={circleClass} />
          : (
            <button
              key={n}
              type='button'
              className={circleClass}
              aria-pressed={fouls >= n}
              aria-label={insertWords(t.foul, isRed ? 'AKA' : 'AO', n)}
              onClick={() => handleChange(n)}
            />
          )
      })}
    </div>
  )
}
