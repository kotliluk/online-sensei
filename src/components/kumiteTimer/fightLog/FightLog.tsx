import { JSX, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import './FightLog.scss'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { Button } from '../../atoms/button/Button'
import { FightLogEntry } from '../../../types/fightLog'
import { formatFightEvent } from '../../../logic/fightLog/format'
import { parseTime } from '../../../utils/time'


interface FightLogProps {
  entries: FightLogEntry[]
  /**
   * Rendered next to the toggle. The panel does not decide what belongs there -
   * exporting the fight is the screen's business, not the log's - it only knows
   * that the two controls read as a pair and sit on one line.
   */
  action?: ReactNode
}

/**
 * What has happened in the fight so far, newest at the bottom.
 *
 * Closed by default. The screen is already tight on a phone and during a fight
 * the scoreboard is what matters; the log is for afterwards, when somebody asks
 * how the score got where it is.
 */
export const FightLog = ({ entries, action }: FightLogProps): JSX.Element => {
  const { kumiteTimer: { timerScreen: { log: t } } } = useSelector(selectTranslation)

  const [isOpen, setIsOpen] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [setIsOpen])

  // the entry worth seeing is the one that just happened, and it is at the bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [isOpen, entries])

  return (
    <section className='fight-log'>
      <div className='fight-log__controls'>
        <Button className='fight-log__toggle' onClick={handleToggle}>
          {`${t.toggle} (${entries.length})`}
        </Button>
        {action}
      </div>

      {isOpen && (
        entries.length === 0
          ? <p className='fight-log__empty'>{t.empty}</p>
          : (
            <ol className='fight-log__entries with-scrollbar' ref={listRef}>
              {/*
                Grouping can rewrite an entry, and a correction that cancels out removes one
                from the middle, so an index is not a stable identity. It is used anyway
                because these items hold no state of their own - everything they show comes
                from props. An item that gains state (expanding, animating, focus) needs a
                real key first.
              */}
              {entries.map((entry, i) => (
                <li className='fight-log__entry' key={i}>
                  <span className='fight-log__entry-time'>{parseTime(entry.fightTime)}</span>
                  <span className='fight-log__entry-event'>{formatFightEvent(entry.event, t)}</span>
                </li>
              ))}
            </ol>
          )
      )}
    </section>
  )
}
