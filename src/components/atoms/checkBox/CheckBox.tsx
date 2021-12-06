// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import './CheckBox.scss'


interface CheckBoxProps {
  className?: string
  checked: boolean
  onChange: (selected: boolean) => void
}

export const CheckBox = (props: CheckBoxProps): JSX.Element => {
  const { className, checked, onChange } = props

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }, [onChange])

  return (
    <span className={`__checkbox_container ${checked ? 'checked' : ''} ${className ?? ''}`}>
      <span className='checkmark'/>
      <input type='checkbox' checked={checked} onChange={handleChange} />
    </span>
  )
}
