// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Input.scss'


interface InputProps {
  type: 'text' | 'number' | 'color' | 'range'
  value: string | number
  onChange: (value: string) => void
  className?: string
  min?: number
  max?: number
  invalid?: boolean
  errorMessage?: string
}

export const Input = (props: InputProps): JSX.Element => {
  const { className, onChange, invalid, errorMessage, ...other } = props

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <div className={`__input-wrapper ${invalid ? 'invalid' : ''}`}>
      <input className={`__input ${className ?? ''}`} onChange={handleChange} {...other} />
      {errorMessage && <span className='__input-msg'>{errorMessage}</span>}
    </div>
  )
}
