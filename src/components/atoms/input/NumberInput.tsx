// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { Input } from './Input'
import { parseIntOrDefault } from '../../../utils/number'


interface InputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  min?: number
  max?: number
  invalid?: boolean
  errorMessage?: string
  disabled?: boolean
}

export const NumberInput = (props: InputProps): JSX.Element => {
  const { value, onChange, min, max, ...other } = props

  const handleChange = useCallback((newValue: string) => {
    let num = (newValue === '') ? 0 : parseIntOrDefault(newValue, value)
    if (min !== undefined && num < min) {
      num = min
    }
    if (max !== undefined && num > max) {
      num = max
    }
    onChange(num)
  }, [value, onChange])

  return (
    <Input type='text' value={value} onChange={handleChange} {...other} />
  )
}
