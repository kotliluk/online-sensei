// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './Select.scss'


interface SelectProps {
  selected: [string, string]
  values: [string, string][]
  onChange: (value: [string, string]) => void
  id?: string
  className?: string
}

export const Select = (props: SelectProps): JSX.Element => {
  const { selected, values, onChange, id, className } = props

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = values.find(v => v[0] === e.target.value)
    value && onChange(value)
  }, [values, onChange])

  return (
    <select
      id={id}
      value={selected[0]}
      onChange={handleChange}
      className={className}
    >
      {values.map(v => <option key={v[0]} value={v[0]}>{v[1]}</option>)}
    </select>
  )
}
