// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, DragEvent } from 'react'
import './SetUpAdvancedInterval.scss'
import { Select } from '../../atoms/select/Select'
import { Interval, IntervalType } from '../../../types/interval'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { Translation } from '../../../logic/translation/translation'
import { Cross } from '../../icons/Cross'


const DND_TYPE = 'DND_ADVANCED_INTERVAL'

interface SetUpAdvancedIntervalProps {
  index: number
  interval: Interval
  onChange: (interval: Interval) => void
  onDelete: () => void
  onMove: (from: number, to: number) => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: number
  disabledDelete: boolean
  translation: Translation['intervalTimer']['setUpScreenAdvanced']['intervalInSeries']
}

export const SetUpAdvancedInterval = (props: SetUpAdvancedIntervalProps): JSX.Element => {
  const {
    index,
    interval,
    onChange, onDelete, onMove,
    onDragStart, onDragEnd, isDragging,
    disabledDelete,
    translation,
  } = props

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: DND_TYPE, payload: index }))
    onDragStart()
  }, [onDragStart])

  const handleDragDrop = useCallback((e: DragEvent<HTMLDivElement>, type: 'BEFORE' | 'AFTER') => {
    const data = JSON.parse(e.dataTransfer.getData('application/json'))

    if (data.type === DND_TYPE) {
      e.preventDefault()
      onMove(data.payload, type === 'BEFORE' ? index : (index + 1))
    }
  }, [index, onMove])

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

  // TODO - validation

  const activeBeforeDndEnd = isDragging > -1 && isDragging !== index && isDragging !== (index - 1)
  const activeAfterDndEnd = isDragging > -1 && isDragging !== index && isDragging !== (index + 1)

  return (
    <>
      <div
        className={`advanced-interval-dnd-end ${(activeBeforeDndEnd) ? 'active' : ''}`}
        onDragOver={e => activeBeforeDndEnd && e.preventDefault()}
        onDrop={e => handleDragDrop(e, 'BEFORE')}
      />
      <div
        className='set-up-advanced-interval'
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
      >
        <span className='advanced-interval-index'>{index + 1})</span>

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
            <div
              className='set-up-div set-up-name'
              draggable={true}
              onDragStart={e => { e.preventDefault(); e.stopPropagation() }}
            >
              <Input
                className='set-up-name-input'
                type='text'
                value={interval.name}
                onChange={handleNameChange}
              />
            </div>
          </li>

          <li className='advanced-interval-item'>
            <label>{translation.duration}:</label>
            <div
              className='set-up-div set-up-duration'
              draggable={true}
              onDragStart={e => { e.preventDefault(); e.stopPropagation() }}
            >
              <NumberInput
                className='set-up-duration-input'
                value={interval.duration}
                onChange={handleDurationChange}
              />
            </div>
          </li>
        </ul>

        <Button
          className='advanced-interval-del-btn'
          onClick={onDelete}
          disabled={disabledDelete}
        >
          <Cross />
        </Button>
      </div>
      <div
        className={`advanced-interval-dnd-end ${(activeAfterDndEnd) ? 'active' : ''}`}
        onDragOver={e => activeAfterDndEnd && e.preventDefault()}
        onDrop={e => handleDragDrop(e, 'AFTER')}
      />
    </>
  )
}
