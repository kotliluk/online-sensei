import { JSX, useCallback } from 'react'
import './SetUpAdvancedInterval.scss'
import { Select } from '../../atoms/select/Select'
import { Interval, IntervalType } from '../../../types/interval'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { Translation } from '../../../logic/translation/translation'
import { Cross } from '../../icons/Cross'
import { ArrowUp } from '../../icons/ArrowUp'
import { ArrowDown } from '../../icons/ArrowDown'
import { LIMITS, VALIDATOR } from '../../../redux/intervalTimer/utils'
import { insertWords } from '../../../logic/translation'


interface SetUpAdvancedIntervalProps {
  index: number
  interval: Interval
  onChange: (interval: Interval) => void
  onDelete: () => void
  onMove: (to: number) => void
  isLast: boolean
  disabledDelete: boolean
  translation: Translation['intervalTimer']['setUpScreenAdvanced']['intervalInSeries']
}

export const SetUpAdvancedInterval = (props: SetUpAdvancedIntervalProps): JSX.Element => {
  const {
    index,
    interval,
    onChange, onDelete, onMove,
    isLast,
    disabledDelete,
    translation,
  } = props

  const handleTypeChange = useCallback((newValue: string) => {
    onChange({
      ...interval,
      type: newValue as IntervalType,
    })
  }, [interval, onChange])

  const handleNameChange = useCallback((newValue: string) => {
    onChange({
      ...interval,
      name: newValue,
    })
  }, [interval, onChange])

  const handleDurationChange = useCallback((newValue: number) => {
    onChange({
      ...interval,
      duration: newValue,
    })
  }, [interval, onChange])

  const isValidDuration = VALIDATOR.simpleWork(interval.duration)

  // The row number is what the arrows talk about, so it is what their names say. Six
  // buttons called "Move up" would otherwise be six buttons a screen reader cannot tell
  // apart - the same reason the fouls are numbered in their labels.
  const position = index + 1

  return (
    <div className='set-up-advanced-interval'>
      <span className='advanced-interval-index'>{position})</span>

      <ul className='advanced-interval-items'>
        <li className='advanced-interval-item'>
          <label>{translation.type.label}:</label>
          <div className='set-up-div set-up-type'>
            <Select
              className='set-up-type-select'
              selected={interval.type}
              values={[
                { value: 'work', text: translation.type.work },
                { value: 'pause', text: translation.type.pause },
              ]}
              onChange={handleTypeChange}
            />
          </div>
        </li>

        <li className='advanced-interval-item'>
          <label>{translation.name}:</label>
          <div className='set-up-div set-up-name'>
            <Input
              className='set-up-name-input'
              type='text'
              value={interval.name}
              onChange={handleNameChange}
            />
          </div>
        </li>

        <li className='advanced-interval-item'>
          <label>{translation.duration.label}:</label>
          <div className='set-up-div set-up-duration'>
            <NumberInput
              className='set-up-duration-input'
              value={interval.duration}
              onChange={handleDurationChange}
              invalid={!isValidDuration}
              errorMessage={insertWords(translation.duration.error, LIMITS.simpleWork.min, LIMITS.simpleWork.max)}
            />
          </div>
        </li>
      </ul>

      <div className='advanced-interval-buttons'>
        <div className='advanced-interval-move-btns'>
          <Button
            className='advanced-interval-move-btn'
            aria-label={insertWords(translation.moveUp, position)}
            onClick={() => onMove(index - 1)}
            disabled={index === 0}
          >
            <ArrowUp fill='currentColor' width={20} height={20} />
          </Button>

          <Button
            className='advanced-interval-move-btn'
            aria-label={insertWords(translation.moveDown, position)}
            onClick={() => onMove(index + 1)}
            disabled={isLast}
          >
            <ArrowDown fill='currentColor' width={20} height={20} />
          </Button>
        </div>

        <Button
          className='advanced-interval-del-btn'
          aria-label={insertWords(translation.delete, position)}
          onClick={onDelete}
          disabled={disabledDelete}
        >
          <Cross fill='currentColor' width={16} height={16} />
        </Button>
      </div>
    </div>
  )
}
