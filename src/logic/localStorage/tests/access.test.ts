import { getValidatedObjectFromLS, getValidatedTypeFromLS } from '../access'
import { isValidArrayOf } from '../../validation/validators'


const alwaysValid = (): boolean => true

beforeEach(() => {
  localStorage.clear()
})

/**
 * Whatever is in local storage may come from a hand edit, a half-finished write or an
 * older version of the app with a different shape. The app dispatches its init actions
 * while the store module is still being imported, so anything thrown here takes the whole
 * page down before a single screen renders - and on a phone the only way back is clearing
 * the site data.
 */
describe('getValidatedTypeFromLS - untrusted storage', () => {
  test.each([
    { label: 'truncated json', stored: '[{' },
    { label: 'not json at all', stored: 'not json' },
    { label: 'a number where an array belongs', stored: '5' },
    { label: 'a string where an array belongs', stored: '"a string"' },
    { label: 'an object where an array belongs', stored: '{"a":1}' },
  ])('falls back to the default on $label', ({ stored }) => {
    // arrange
    localStorage.setItem('K', stored)
    // act
    const result = getValidatedTypeFromLS('K', isValidArrayOf(alwaysValid), ['default'])
    // assert
    expect(result).toEqual(['default'])
  })

  test('writes the default back, so the bad value cannot bite twice', () => {
    // arrange
    localStorage.setItem('K', '[{')
    // act
    getValidatedTypeFromLS('K', isValidArrayOf(alwaysValid), ['default'])
    // assert
    expect(localStorage.getItem('K')).toBe(JSON.stringify(['default']))
  })

  test('a valid value is returned untouched', () => {
    // arrange
    localStorage.setItem('K', JSON.stringify(['kept']))
    // act + assert
    expect(getValidatedTypeFromLS('K', isValidArrayOf(alwaysValid), ['default'])).toEqual(['kept'])
  })

  test('a value the validator rejects is replaced by the default', () => {
    // arrange
    localStorage.setItem('K', JSON.stringify(['rejected']))
    // act
    const result = getValidatedTypeFromLS('K', () => false, ['default'])
    // assert
    expect(result).toEqual(['default'])
    expect(localStorage.getItem('K')).toBe(JSON.stringify(['default']))
  })

  test('a missing key is seeded with the default', () => {
    // act
    getValidatedTypeFromLS('K', alwaysValid, 'seed')
    // assert
    expect(localStorage.getItem('K')).toBe(JSON.stringify('seed'))
  })

  test('null stays available for the trees, which default to it', () => {
    // arrange - `tournamentTree` and `repechageTree` are null until a tournament starts
    localStorage.setItem('K', 'null')
    // act + assert
    expect(getValidatedTypeFromLS<string | null>('K', alwaysValid, null)).toBeNull()
  })
})

describe('getValidatedObjectFromLS - untrusted storage', () => {
  test('falls back to the default on broken json', () => {
    // arrange
    localStorage.setItem('K', '{"a":1')
    // act + assert
    expect(getValidatedObjectFromLS('K', alwaysValid, { fallback: true })).toEqual({ fallback: true })
  })
})

describe('isValidArrayOf', () => {
  test.each([
    { label: 'a number', value: 5 },
    { label: 'a string', value: 'a string' },
    { label: 'an object', value: { a: 1 } },
    { label: 'null', value: null },
  ])('answers false for $label instead of throwing', ({ value }) => {
    // act + assert - the validator is handed whatever `JSON.parse` produced
    expect(isValidArrayOf(alwaysValid)(value as never)).toBe(false)
  })

  test('answers true for an array whose items pass', () => {
    // act + assert
    expect(isValidArrayOf((n: number) => n > 0)([1, 2])).toBe(true)
  })

  test('answers false when an item fails', () => {
    // act + assert
    expect(isValidArrayOf((n: number) => n > 0)([1, -2])).toBe(false)
  })
})
