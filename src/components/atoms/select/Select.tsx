// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Select.scss'


interface SelectProps {
  selected: string
  values: { value: string, text: string }[]
  onChange: (value: string) => void
  id?: string
  className?: string
}

export const Select = (props: SelectProps): JSX.Element => {
  const { selected, values, onChange, id, className } = props

  return (
    <select
      id={id}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {values.map(v => <option key={v.value} value={v.value}>{v.text}</option>)}
    </select>
  )
}
