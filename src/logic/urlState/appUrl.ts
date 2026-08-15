import { config } from '../../config'


/**
 * Builds an absolute URL into the app.
 *
 * The single place that knows how a link to a route is assembled - used both by
 * the share buttons on the set-up screens and by the kumite mirror window.
 *
 * @param path route path, starting with '/' (e.g. '/reactions/set-up')
 * @param params optional query parameters
 */
export const buildAppUrl = (path: string, params?: URLSearchParams): string => {
  const query = params?.toString() ?? ''

  return window.location.origin
    + config.basename
    + path
    + (query === '' ? '' : `?${query}`)
}

export const KUMITE_TIMER_MIRROR_PATH = '/kumite-timer/mirror'
