import { useCallback, useEffect, useState } from 'react'


/**
 * Returns value of the given key in local storage and automatically updates it as it changes in local storage.
 */
export const useLSSyncConsumer = <T = string>(key: string, parser: (value: string | null) => T): T => {
  const [value, setValue] = useState(localStorage.getItem(key))

  const update = useCallback(() => {
    setValue(localStorage.getItem(key))
  }, [setValue])

  useEffect(() => {
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [update])

  return parser(value)
}
