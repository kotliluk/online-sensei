// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Input.scss'
import { Input } from './Input'
import { parseIntOrDefault } from '../../../utils/number'


interface InputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  min?: number
  max?: number
}

export const NumberInput = (props: InputProps): JSX.Element => {
  const { value, onChange, ...other } = props

  const handleChange = useCallback((newValue: string) => {
    onChange(parseIntOrDefault(newValue, value))
  }, [value, onChange])

  return (
    <Input type='number' value={value} onChange={handleChange} {...other} />
  )
}
