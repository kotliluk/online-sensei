import { buildAppUrl, KUMITE_TIMER_MIRROR_PATH } from '../appUrl'


/**
 * The app is deployed under `/online-sensei/`, not at the root of the domain. A link built
 * without that prefix lands on GitHub's own 404 page, and it does it only in production -
 * the dev server answers on either path, so nothing about it shows up locally.
 */
describe('buildAppUrl', () => {
  test('puts the app base between the origin and the route', () => {
    // act
    const url = buildAppUrl('/reactions/set-up')
    // assert - written out rather than composed from `config`, which would only prove
    // that the function and the test read the same variable
    expect(url).toBe(`${window.location.origin}/online-sensei/reactions/set-up`)
  })

  test('hangs the query on the end', () => {
    // arrange
    const params = new URLSearchParams({ rounds: '25', signal: '350' })
    // act
    const url = buildAppUrl('/reactions/set-up', params)
    // assert
    expect(url).toBe(`${window.location.origin}/online-sensei/reactions/set-up?rounds=25&signal=350`)
  })

  test('leaves the question mark off when there is nothing to ask', () => {
    // act
    const url = buildAppUrl('/reactions/set-up', new URLSearchParams())
    // assert
    expect(url).not.toContain('?')
  })

  test('builds the mirror link the same way', () => {
    // act - this one is opened in a second window, so a wrong base shows as a blank tab
    const url = buildAppUrl(KUMITE_TIMER_MIRROR_PATH)
    // assert
    expect(url).toBe(`${window.location.origin}/online-sensei/kumite-timer/mirror`)
  })
})
