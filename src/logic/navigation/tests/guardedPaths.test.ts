import { isGuardedPath } from '../guardedPaths'


describe('isGuardedPath', () => {
  /**
   * The set-up screens are the reason this compares whole paths instead of prefixes.
   * `/kumite-timer` guards a fight, but `/kumite-timer/set-up` is where somebody types
   * the names in and `/kumite-timer/mirror` only reads what another window wrote - a
   * prefix match would lock the header on both and ask before leaving either.
   */
  test.each([
    { pathname: '/reactions', expected: true },
    { pathname: '/kumite-timer', expected: true },
    { pathname: '/kumite-timer/tournament', expected: true },
    { pathname: '/interval-timer', expected: true },
    { pathname: '/group-stopwatch', expected: true },

    { pathname: '/', expected: false },
    { pathname: '/reactions/set-up', expected: false },
    { pathname: '/kumite-timer/set-up', expected: false },
    { pathname: '/kumite-timer/mirror', expected: false },
    { pathname: '/interval-timer/set-up', expected: false },
    { pathname: '/group-stopwatch/set-up', expected: false },
    { pathname: '/nonsense', expected: false },
  ])('$pathname -> $expected', ({ pathname, expected }) => {
    // act
    const actual = isGuardedPath(pathname)
    // assert
    expect(actual).toBe(expected)
  })

  /**
   * A trailing slash is the same screen. The router does not produce one, but the
   * spa-github-pages redirect in `public/404.html` rebuilds the path by hand before
   * React boots, and a deep link that arrives as `/kumite-timer/` must not slip the
   * guard over one character.
   */
  test.each([
    { pathname: '/kumite-timer/', expected: true },
    { pathname: '/group-stopwatch/', expected: true },
    { pathname: '/kumite-timer/set-up/', expected: false },
  ])('$pathname -> $expected', ({ pathname, expected }) => {
    // act
    const actual = isGuardedPath(pathname)
    // assert
    expect(actual).toBe(expected)
  })
})
