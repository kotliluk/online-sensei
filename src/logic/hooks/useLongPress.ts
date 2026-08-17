import { MouseEvent, PointerEvent, useCallback, useRef } from 'react'


/** Long enough not to be hit while tapping, short enough not to feel stuck. */
export const LONG_PRESS_MS = 600

/**
 * How far a finger may travel and still count as standing still.
 *
 * A press that turns into a drag is somebody scrolling the list, and taking that as
 * a long press would wipe a measured time by accident.
 */
const MOVE_TOLERANCE_PX = 10

export interface PressHandlers {
  onPointerDown: (event: PointerEvent) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: () => void
  onPointerLeave: () => void
  onPointerCancel: () => void
  onContextMenu: (event: MouseEvent) => void
}

/**
 * Tells a tap and a hold apart on one element, for a mouse and a finger alike.
 *
 * It owns **both** branches on purpose. The obvious shape - `onClick` for the tap and
 * a timer for the hold - has a hole in it: the browser still sends the click when the
 * finger comes up, so a hold that cleared something would immediately put it back.
 * Here the release only presses when the hold did not fire.
 *
 * The hold fires while the pointer is still down rather than on release, because that is
 * the only feedback there is that something happened.
 */
export const useLongPress = (
  onPress: () => void,
  onLongPress: () => void,
  ms = LONG_PRESS_MS,
): PressHandlers => {
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // where the press started, and at the same time whether one is still going on
  const origin = useRef<{ x: number, y: number } | undefined>(undefined)

  const cancel = useCallback(() => {
    clearTimeout(timeout.current)
    timeout.current = undefined
    origin.current = undefined
  }, [])

  const handlePointerDown = useCallback((event: PointerEvent) => {
    // the right button opens a menu, it does not press anything
    if (event.button !== 0) {
      return
    }

    clearTimeout(timeout.current)
    origin.current = { x: event.clientX, y: event.clientY }

    timeout.current = setTimeout(() => {
      // giving up the press here is what keeps the release from pressing as well
      cancel()
      onLongPress()
    }, ms)
  }, [cancel, onLongPress, ms])

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const start = origin.current

    if (start !== undefined && Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE_PX) {
      cancel()
    }
  }, [cancel])

  /**
   * Android decided this is a hold before we did.
   *
   * Measured on a phone: Chrome answers a long press with its own menu at around half a
   * second, and opening it cancels the pointer stream - so a hold on a slower threshold
   * never fires at all, and the person gets a print and share menu instead of the thing
   * they were holding. Rather than racing the platform to a shorter number, the platform's
   * own verdict is taken as the answer.
   *
   * Only while a press is under way, so a plain right click still opens the menu it should.
   */
  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (origin.current === undefined) {
      return
    }

    event.preventDefault()
    cancel()
    onLongPress()
  }, [cancel, onLongPress])

  const handlePointerUp = useCallback(() => {
    const wasPressing = origin.current !== undefined
    cancel()

    if (wasPressing) {
      onPress()
    }
  }, [cancel, onPress])

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: handleContextMenu,
  }
}
