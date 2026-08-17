import { vi } from 'vitest'
import { JSX } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { LONG_PRESS_MS, useLongPress } from '../useLongPress'


const press = vi.fn()
const longPress = vi.fn()

/**
 * The hook is driven through a real element rather than by calling the handlers it
 * returns, because half of what it has to get right is which DOM events it listens to.
 *
 * `fireEvent` and not `userEvent`: measured that `userEvent` never resolves under fake
 * timers here - it waits on a clock that only the test moves - while `fireEvent` sends
 * the same pointer events synchronously and carries the coordinates.
 */
const Pressable = (): JSX.Element => {
  const handlers = useLongPress(press, longPress)

  return <div data-testid='pressable' {...handlers}>press me</div>
}

const setUp = (): HTMLElement => {
  render(<Pressable />)

  return screen.getByTestId('pressable')
}

const wait = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    press.mockClear()
    longPress.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('a short press is a press', () => {
    // arrange
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    wait(LONG_PRESS_MS - 100)
    fireEvent.pointerUp(target)
    // assert
    expect(press).toHaveBeenCalledTimes(1)
    expect(longPress).not.toHaveBeenCalled()
  })

  test('holding fires the long press without waiting for the release', () => {
    // arrange - the card has to react while the finger is still down, otherwise there is
    // no way to tell a hold from a tap that has not ended yet
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    wait(LONG_PRESS_MS)
    // assert
    expect(longPress).toHaveBeenCalledTimes(1)
    expect(press).not.toHaveBeenCalled()
  })

  test('releasing after a long press does not press as well', () => {
    // arrange - this is the whole reason the hook owns both branches: something cleared
    // by a hold and then saved again by the release is worse than no hold at all
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    wait(LONG_PRESS_MS + 200)
    fireEvent.pointerUp(target)
    // assert
    expect(longPress).toHaveBeenCalledTimes(1)
    expect(press).not.toHaveBeenCalled()
  })

  test('a finger that travels is scrolling, not pressing', () => {
    // arrange - the list of competitors scrolls, and dragging it must not wipe a time
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(target, { clientX: 100, clientY: 140 })
    wait(LONG_PRESS_MS + 200)
    fireEvent.pointerUp(target)
    // assert
    expect(longPress).not.toHaveBeenCalled()
    expect(press).not.toHaveBeenCalled()
  })

  test('a small wobble is still a press', () => {
    // arrange - nobody holds a finger perfectly still
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    fireEvent.pointerMove(target, { clientX: 103, clientY: 102 })
    wait(LONG_PRESS_MS)
    // assert
    expect(longPress).toHaveBeenCalledTimes(1)
  })

  test.each([
    { name: 'the pointer leaves the element', leave: fireEvent.pointerLeave },
    { name: 'the browser takes the gesture over', leave: fireEvent.pointerCancel },
  ])('gives up when $name', ({ leave }) => {
    // arrange
    const target = setUp()
    // act
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    leave(target)
    wait(LONG_PRESS_MS + 200)
    fireEvent.pointerUp(target)
    // assert
    expect(longPress).not.toHaveBeenCalled()
    expect(press).not.toHaveBeenCalled()
  })

  describe('when the browser calls it a long press first', () => {
    test('takes that as the hold and keeps its menu out of the way', () => {
      // arrange - Chrome on Android opens a menu at around half a second, sooner than the
      // hold would fire, and opening it cancels the pointer stream
      const target = setUp()
      // act
      fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
      const notPrevented = fireEvent.contextMenu(target)
      // assert
      expect(longPress).toHaveBeenCalledTimes(1)
      expect(notPrevented).toBe(false)
    })

    test('does not then press when the finger comes up', () => {
      // arrange
      const target = setUp()
      // act
      fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
      fireEvent.contextMenu(target)
      wait(LONG_PRESS_MS + 200)
      fireEvent.pointerUp(target)
      // assert - and the timer that was still running must not fire a second time
      expect(longPress).toHaveBeenCalledTimes(1)
      expect(press).not.toHaveBeenCalled()
    })

    test('leaves a plain right click to open the menu it should', () => {
      // arrange - nothing is being held here, somebody just right clicked
      const target = setUp()
      // act
      const notPrevented = fireEvent.contextMenu(target)
      // assert
      expect(longPress).not.toHaveBeenCalled()
      expect(notPrevented).toBe(true)
    })

    test('the right button does not start a press at all', () => {
      // arrange
      const target = setUp()
      // act
      fireEvent.pointerDown(target, { clientX: 100, clientY: 100, button: 2 })
      wait(LONG_PRESS_MS)
      fireEvent.pointerUp(target)
      // assert
      expect(longPress).not.toHaveBeenCalled()
      expect(press).not.toHaveBeenCalled()
    })
  })

  test('a second gesture works the same as the first', () => {
    // arrange - whatever the hook keeps between events has to be put back afterwards
    const target = setUp()
    // act - a hold, then a tap
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    wait(LONG_PRESS_MS)
    fireEvent.pointerUp(target)
    fireEvent.pointerDown(target, { clientX: 100, clientY: 100 })
    wait(100)
    fireEvent.pointerUp(target)
    // assert
    expect(longPress).toHaveBeenCalledTimes(1)
    expect(press).toHaveBeenCalledTimes(1)
  })
})
