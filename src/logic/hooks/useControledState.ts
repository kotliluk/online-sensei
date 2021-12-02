import { useCallback, useState } from 'react'


/**
 * Custom useState hook extension with auto validity checking and setting only valid values.
 *
 * @return array with value and controlled value setter
 */
const useControlledState = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [T, (newValue: T) => void] => {
  const [value, setValue] = useState(initialValue)

  const setControlledValue = useCallback((newValue: T) => {
    if (validator(newValue)) {
      setValue(newValue)
    }
  }, [validator, setValue])

  return [value, setControlledValue]
}

export default useControlledState
