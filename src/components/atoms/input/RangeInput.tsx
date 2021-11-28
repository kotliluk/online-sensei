// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './RangeInput.scss'


interface RangeInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  min: number
  max: number
  disabled?: boolean
}

export const RangeInput = (props: RangeInputProps): JSX.Element => {
  const { onChange, className, ...other } = props

  return (
    <input
      className={`__range_input ${className ?? ''}`}
      type='range'
      onChange={e => onChange(Number.parseInt(e.target.value))}
      {...other}
    />
  )
}
