// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './CheckBox.scss'


interface CheckBoxProps {
  checked: boolean
  onChange: (selected: boolean) => void
}

export const CheckBox = (props: CheckBoxProps): JSX.Element => {
  const { checked, onChange } = props

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }, [onChange])

  return (
    <input type='checkbox' checked={checked} onChange={handleChange} />
  )
}
