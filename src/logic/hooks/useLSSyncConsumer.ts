import { useCallback, useEffect, useState } from 'react'
import { unquote } from '../../utils/string'


/**
 * Returns value of the given key in local storage and automatically updates it as it changes in local storage.
 */
/**
 * The writing side stores through `JSON.stringify`, so a string arrives wrapped in quotes.
 * Both ways in have to strip them, or the parser sees `"RED"` at mount and `RED` from then
 * on - which every parser that compares against a literal gets wrong exactly once, on the
 * first render, and never again.
 */
const read = (key: string): string | null => {
  const raw = localStorage.getItem(key)
  return raw === null ? null : unquote(raw)
}

export const useLSSyncConsumer = <T = string>(key: string, parser: (value: string | null) => T): T => {
  const [value, setValue] = useState(() => read(key))

  const update = useCallback(() => {
    setValue(read(key))
  }, [setValue, key])

  useEffect(() => {
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [update])

  return parser(value)
}
