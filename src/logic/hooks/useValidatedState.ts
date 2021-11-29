import { useEffect, useState } from 'react'


/**
 * Custom useState hook extension with auto validity checking after value changes.
 *
 * @return array with value, value setter, and value validity
 */
const useValidatedState = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [T, (newValue: T) => void, boolean] => {
  const [value, setValue] = useState(initialValue)
  const [isValid, setIsValid] = useState(validator(initialValue))

  useEffect(() => {
    setIsValid(validator(value))
  }, [validator, value, setIsValid])

  return [value, setValue, isValid]
}

export default useValidatedState
