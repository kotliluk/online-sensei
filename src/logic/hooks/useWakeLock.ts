import { useEffect } from 'react'


/**
 * Keeps the device from putting the screen out while the component is mounted.
 *
 * These clocks are meant to be watched from across a hall with nobody's finger near the
 * phone, so a screen that dims mid-round is not merely inconvenient. It is also what makes
 * the end of a fight sound wrong: iOS goes on running the timers on a dark screen but
 * throttles the audio decoding, so the horn comes out garbled and short - measured on a
 * real phone while verifying ticket 011.
 *
 * Everything here is best effort. No wake lock API at all (iOS before 16.4, or anything
 * over plain http) and a refusal from the browser both leave the screen behaving exactly
 * as it did before, with nothing said to the user about either.
 */
export const useWakeLock = (enabled = true): void => {
  useEffect(() => {
    // The type says the API is always there; phones say otherwise.
    if (!enabled || !('wakeLock' in navigator)) {
      return
    }

    let sentinel: WakeLockSentinel | null = null
    let requesting = false
    let dropped = false

    const acquire = (): void => {
      requesting = true

      void navigator.wakeLock.request('screen')
        .then((lock) => {
          // the effect can be torn down while the request is still on its way back
          if (dropped) {
            void lock.release()
          } else {
            sentinel = lock
          }
        })
        .catch(() => {
          // A refusal is an ordinary answer - a low battery or a power saving mode is
          // enough for one - and there is nothing to do about it and nothing worth
          // interrupting the user with.
        })
        .finally(() => {
          requesting = false
        })
    }

    /**
     * The browser takes the lock back on its own whenever the document is hidden, and does
     * not hand it back on the way in. Asked for only once, the lock would hold until the
     * first time anybody looked at anything else, and then quietly stop working.
     */
    const ensureLock = (): void => {
      const held = sentinel !== null && !sentinel.released

      if (requesting || held || document.visibilityState !== 'visible') {
        return
      }

      acquire()
    }

    ensureLock()
    document.addEventListener('visibilitychange', ensureLock)

    return () => {
      dropped = true
      document.removeEventListener('visibilitychange', ensureLock)
      void sentinel?.release()
      sentinel = null
    }
  }, [enabled])
}
