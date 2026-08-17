/**
 * The arithmetic behind turning something on screen into a picture file.
 *
 * Kept apart from the drawing itself so it can be tested: jsdom has no canvas
 * and no `getBBox`, so anything that reads either of those can only be checked
 * in a real browser. What is decided here is decided with numbers.
 */

import { tournamentFileName } from './fileName'


export const PNG_MIME_TYPE = 'image/png'

/** Named like the csv exports, so a tournament's files sit together in a folder. */
export const tournamentPictureFileName = (name: string, now: Date): string => {
  return tournamentFileName('picture', name, now, 'png')
}

/**
 * Light whatever theme the app is in.
 *
 * The picture leaves for a chat, a print or a file preview, and none of those
 * inherit a dark theme. Measured on the dark one: the black connecting lines of
 * a bracket on the dark grey page colour are barely readable, and the names sit
 * in black on light red and blue anyway - the drawing was designed for a light
 * surround, so it gets one.
 */
export const PICTURE_BACKGROUND = '#ffffff'

/** Room around the content, so nothing in the picture touches its own edge. */
export const PICTURE_PADDING = 16

/** Sharp enough to zoom into in a chat and to print, without being silly about it. */
export const PICTURE_MAX_SCALE = 2

/**
 * How many pixels the finished picture may cover.
 *
 * Browsers cap the size of a canvas and **exceeding it returns a blank image
 * rather than an error**, which is the worst way for this to fail - a white
 * rectangle downloaded at a tournament looks like the feature simply does not
 * work. Desktop Chrome allows far more than this; iOS Safari gives up somewhere
 * around 17 megapixels, so the budget sits below that with room to spare.
 *
 * For scale: a bracket of 16 measures 1432x1502 css pixels, so it still gets the
 * full 2x. A bracket of 64 measures 2232x6542 and comes out slightly under 1x -
 * a legible picture instead of a blank one.
 */
export const PICTURE_PIXEL_BUDGET = 12_000_000

/**
 * How much to multiply a picture of this size by: as sharp as allowed, unless
 * that would overrun the budget, in which case exactly the budget.
 */
export const pictureScale = (
  width: number,
  height: number,
  budget = PICTURE_PIXEL_BUDGET,
  maxScale = PICTURE_MAX_SCALE,
): number => {
  const area = width * height

  if (area <= 0) {
    return maxScale
  }

  return Math.min(maxScale, Math.sqrt(budget / area))
}

export type Box = { x: number, y: number, width: number, height: number }

export type StackItem = { width: number, height: number, heading: boolean }

export type StackedLayout = { width: number, height: number, tops: number[] }

/**
 * Where each part of a picture goes when they are stacked one under the other.
 *
 * A part that is labelled - the repechage, which the screen puts a heading over -
 * is pushed down to leave room for it, and `tops` is where the drawing starts
 * rather than where the block starts, so the caller does not have to subtract the
 * heading back out again.
 */
export const stackBlocks = (items: StackItem[], headingHeight: number): StackedLayout => {
  const tops: number[] = []
  let height = 0

  items.forEach((item) => {
    height += item.heading ? headingHeight : 0
    tops.push(height)
    height += item.height
  })

  return { width: Math.max(0, ...items.map((item) => item.width)), height, tops }
}

/** The same box with room left around it on every side. */
export const padBox = (box: Box, padding: number): Box => ({
  x: box.x - padding,
  y: box.y - padding,
  width: box.width + padding * 2,
  height: box.height + padding * 2,
})
