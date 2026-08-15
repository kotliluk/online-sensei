import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'


/**
 * Drops the set-up parameters from the URL once the user edits the form.
 *
 * A link describes the set up it was created with, so it stays valid exactly as
 * long as the form still holds those values - up to that point a reload restores
 * the shared set up. From the first edit on the parameters would describe
 * something the screen no longer shows, so they are removed.
 *
 * The baseline is the first value of `current`, not the incoming query string:
 * the two are not comparable, because encoding leaves out defaults, normalises
 * values and fixes the parameter order, so a link written by hand would look
 * like an edit straight away.
 *
 * The URL is replaced rather than pushed, so no history entry is added and the
 * back button keeps working.
 *
 * @param current the current set up, encoded the same way a share link is
 */
export const useClearUrlOnEdit = (current: URLSearchParams): void => {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentQuery = current.toString()

  // both captured on the first render only
  const baseline = useRef(currentQuery)
  const hadParams = useRef(searchParams.toString() !== '')

  const cleared = useRef(false)

  useEffect(() => {
    if (cleared.current || !hadParams.current || currentQuery === baseline.current) {
      return
    }

    cleared.current = true
    setSearchParams({}, { replace: true })
  }, [currentQuery, setSearchParams])
}
