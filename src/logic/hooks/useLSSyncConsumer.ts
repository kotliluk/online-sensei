import { useCallback, useEffect, useState } from 'react'
import { unquote } from '../../utils/string'


/**
 * Returns value of the given key in local storage and automatically updates it as it changes in local storage.
 */
export const useLSSyncConsumer = <T = string>(key: string, parser: (value: string | null) => T): T => {
  const [value, setValue] = useState(localStorage.getItem(key))

  const update = useCallback(() => {
    const newValue = localStorage.getItem(key)
    if (newValue === null) {
      setValue(newValue)
    } else {
      setValue(unquote(newValue))
    }
  }, [setValue, key])

  useEffect(() => {
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [update])

  return parser(value)
}
