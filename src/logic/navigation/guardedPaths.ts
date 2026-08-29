/**
 * The screens something is lost on leaving: a fight in progress, a tournament tree, a
 * running series, a set of measured times. Two unrelated places need to agree on this
 * list - the header, which stops offering the way home, and the leave guard, which asks
 * before Back takes it - so it lives with neither of them.
 *
 * `/kumite-timer/mirror` is deliberately absent. It reads what another window wrote and
 * owns nothing, so guarding it would cost a referee a question and save nothing.
 */
export const GUARDED_PATHS: readonly string[] = [
  '/reactions',
  '/kumite-timer',
  '/kumite-timer/tournament',
  '/interval-timer',
  '/group-stopwatch',
]

/**
 * Whole paths, not prefixes: every guarded screen has a `set-up` sibling underneath it
 * that must stay free, and the kumite fight has the mirror as well.
 */
export const isGuardedPath = (pathname: string): boolean => {
  const withoutTrailingSlash = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname

  return GUARDED_PATHS.includes(withoutTrailingSlash)
}
