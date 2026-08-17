import { JSX } from 'react'
import { Button } from '../../atoms/button/Button'
import { Competitor } from '../../../types/groupStopwatch'
import { useLongPress } from '../../../logic/hooks/useLongPress'


/** What one press of a correction button is worth, and what its label has to say. */
const TIME_STEP_MS = 1000

interface CompetitorCardProps {
  competitor: Competitor
  /** A tap: the competitor has just finished. */
  onSaveTime: () => void
  /** A hold: the saved time was wrong enough to throw away. */
  onClearTime: () => void
  onShiftTime: (deltaMs: number) => void
}

/**
 * One competitor to tap when they finish.
 *
 * Its own component only because of the hook - telling a tap from a hold needs state per
 * card, and hooks cannot be called in a loop. The styles stay in the screen's stylesheet,
 * where they are nested inside the grid that lays the cards out.
 *
 * The correction buttons are **siblings** of the pressed area rather than children of it.
 * Nested, every press of them would travel up to the card and save a time on the way,
 * and the fix for that would be stopping events the shared `Button` cannot even see.
 * Side by side, there is nothing to stop.
 */
export const CompetitorCard = (props: CompetitorCardProps): JSX.Element => {
  const { competitor, onSaveTime, onClearTime, onShiftTime } = props
  const finished = competitor.time !== null

  const press = useLongPress(onSaveTime, () => finished && onClearTime())

  return (
    <div
      className={`competitor-card ${finished ? 'finished' : ''}`}
      style={{ backgroundColor: competitor.color, color: competitor.contrastColor }}
    >
      <div className='competitor-press' {...press}>
        <p className='competitor-name'>{competitor.id}) {competitor.name}</p>
        <p className='competitor-time'>{competitor.timeString}</p>
      </div>

      {finished && (
        <div className='competitor-adjust'>
          <Button onClick={() => onShiftTime(-TIME_STEP_MS)}>−1 s</Button>
          <Button onClick={() => onShiftTime(TIME_STEP_MS)}>+1 s</Button>
        </div>
      )}
    </div>
  )
}
