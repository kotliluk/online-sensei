import { act, renderHook } from '@testing-library/react'
import useControlledState from '../useControledState'


const isBetweenZeroAndFive = (value: number): boolean => value >= 0 && value <= 5

describe('useControlledState', () => {
  test('takes a valid value and reports that it did', () => {
    // arrange
    const { result } = renderHook(() => useControlledState<number>(0, isBetweenZeroAndFive))
    let accepted: boolean | undefined
    // act
    act(() => {
      accepted = result.current[1](3)
    })
    // assert
    expect(accepted).toBe(true)
    expect(result.current[0]).toBe(3)
  })

  test.each([
    { name: 'above the limit', initial: 5, attempted: 6 },
    { name: 'below the limit', initial: 0, attempted: -1 },
  ])('refuses a value $name and leaves the state alone', ({ initial, attempted }) => {
    // arrange - the caller uses the answer to decide whether anything happened,
    // so a refused press must be distinguishable from an accepted one
    const { result } = renderHook(() => useControlledState<number>(initial, isBetweenZeroAndFive))
    let accepted: boolean | undefined
    // act
    act(() => {
      accepted = result.current[1](attempted)
    })
    // assert
    expect(accepted).toBe(false)
    expect(result.current[0]).toBe(initial)
  })

  test('keeps the setter identity while the validator stays the same', () => {
    // arrange
    const { result, rerender } = renderHook(() => useControlledState<number>(0, isBetweenZeroAndFive))
    const setter = result.current[1]
    // act
    rerender()
    // assert - an unstable setter would leak into the dependencies of its callers
    expect(result.current[1]).toBe(setter)
  })
})
