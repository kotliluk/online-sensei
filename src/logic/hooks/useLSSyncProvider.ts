import { useEffect } from 'react'


/**
 * Automatically writes the given value into local storage under the given key when changed.
 *
 * Pass `enabled` as false where the screen has no session of its own. These keys are shared
 * with the mirror in another tab, and a screen that is only mounting on its way to a
 * redirect would otherwise announce its own starting values as if they were the fight -
 * putting a full clock and 0:0 on the projector while the real fight carries on.
 */
export const useLSSyncProvider = (value: any, key: string, enabled = true): void => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key, enabled])
}
