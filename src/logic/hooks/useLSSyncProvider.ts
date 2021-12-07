import { useEffect } from 'react'


/**
 * Automatically writes the given value into local storage under the given key when changed.
 */
export const useLSSyncProvider = (value: any, key: string): void => {
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key])
}
