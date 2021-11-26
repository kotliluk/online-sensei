// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Input.scss'


interface InputProps {
  type: 'text' | 'number' | 'color'
  value: string | number
  onChange: (value: string) => void
  className?: string
  min?: number
  max?: number
}

export const Input = (props: InputProps): JSX.Element => {
  const { className, onChange, ...other } = props

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <input className={`__input ${className ?? ''}`} onChange={handleChange} {...other} />
  )
}
