// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './CounterInput.scss'
import { NumberInput } from './NumberInput'
import { emptyFunc } from '../../../utils/function'
import { Button } from '../button/Button'


interface CounterInputProps {
  value: number
  onChange: (value: number) => void
  inputClassName?: string
  minusBtnClassName?: string
  plusBtnClassName?: string
  min: number
  max: number
  disabled?: boolean
}

export const CounterInput = (props: CounterInputProps): JSX.Element => {
  const { value, onChange, inputClassName, minusBtnClassName, plusBtnClassName, min, max, disabled } = props

  const handleChange = useCallback((incr: number) => {
    const newValue = value + incr
    if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
      onChange(newValue)
    }
  }, [value, onChange])

  return (
    <div className='__counter_input-wrapper'>
      <Button
        className={`__counter_input-btn ${minusBtnClassName ?? ''}`}
        onClick={() => handleChange(-1)}
        disabled={disabled}
      >
        -
      </Button>
      <NumberInput
        className={`__counter_input ${inputClassName ?? ''}`}
        value={value}
        onChange={emptyFunc}
        disabled={disabled}
      />
      <Button
        className={`__counter_input-btn ${plusBtnClassName ?? ''}`}
        onClick={() => handleChange(1)}
        disabled={disabled}
      >
        +
      </Button>
    </div>
  )
}
