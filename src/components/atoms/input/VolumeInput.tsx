// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './VolumeInput.scss'
import { RangeInput } from './RangeInput'
import { Button } from '../button/Button'
import { AudioOff } from '../../icons/AudioOff'
import { AudioOn } from '../../icons/AudioOn'


interface VolumeInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  inputClassName?: string
  buttonClassName?: string
  wrapperClassName?: string
}

export const VolumeInput = (props: VolumeInputProps): JSX.Element => {
  const { value, onChange, disabled, inputClassName, buttonClassName, wrapperClassName } = props
  const [lastNonZeroValue, setLastNonZeroValue] = useState(value * 100)

  const handleToggleMuted = useCallback(() => {
    onChange((value === 0) ? Math.max((lastNonZeroValue / 100), 0.1) : 0)
  }, [value, onChange, lastNonZeroValue])

  const handleVolumeChange = useCallback((value: number) => {
    (value > 0) && setLastNonZeroValue(value)
    onChange(value / 100)
  }, [onChange, setLastNonZeroValue])

  return (
    <div className={`__volume_input-wrapper ${wrapperClassName ?? ''}`}>
      <RangeInput
        className={inputClassName}
        value={value * 100} onChange={handleVolumeChange} min={0} max={100}
        disabled={disabled}
      />
      <Button
        className={`__volume_input-btn ${buttonClassName ?? ''}`}
        onClick={handleToggleMuted}
        disabled={disabled}
      >
        {value === 0 ? <AudioOff /> : <AudioOn />}
      </Button>
    </div>
  )
}
