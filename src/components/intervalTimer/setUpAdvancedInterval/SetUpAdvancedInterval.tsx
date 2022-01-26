// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './SetUpAdvancedInterval.scss'
import { Select } from '../../atoms/select/Select'
import { Interval, IntervalType } from '../../../types/interval'
import { Input } from '../../atoms/input/Input'
import { NumberInput } from '../../atoms/input/NumberInput'
import { Button } from '../../atoms/button/Button'
import { Translation } from '../../../logic/translation/translation'
import { Cross } from '../../icons/Cross'


interface SetUpAdvancedIntervalProps {
  index: number
  interval: Interval
  onChange: (interval: Interval) => void
  onDelete: () => void
  disabledDelete: boolean
  translation: Translation['intervalTimer']['setUpScreenAdvanced']['intervalInSeries']
}

export const SetUpAdvancedInterval = (props: SetUpAdvancedIntervalProps): JSX.Element => {
  const { index, interval, onChange, onDelete, disabledDelete, translation } = props

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

  return (
    <div className='set-up-advanced-interval'>
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
          <label>{translation.duration}:</label>
          <div className='set-up-div set-up-duration'>
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
  )
}
