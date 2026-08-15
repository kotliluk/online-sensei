import { useCallback, useState } from 'react'


/**
 * Custom useState hook extension with auto validity checking and setting only valid values.
 *
 * The setter reports whether the value was taken, so that a caller can tell a
 * change from a press that hit a limit and did nothing.
 *
 * @return array with value and controlled value setter
 */
const useControlledState = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [T, (newValue: T) => boolean] => {
  const [value, setValue] = useState(initialValue)

  const setControlledValue = useCallback((newValue: T): boolean => {
    if (!validator(newValue)) {
      return false
    }

    setValue(newValue)
    return true
  }, [validator, setValue])

  return [value, setControlledValue]
}

export default useControlledState
