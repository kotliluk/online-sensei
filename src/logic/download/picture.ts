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

/** The parts of an `SVGMatrix` that a translate-and-zoom needs. */
export type Transform = { a: number, d: number, e: number, f: number }

/**
 * Where the content of an svg actually sits, in the coordinates its viewBox uses.
 *
 * `getBBox()` answers in the element's own space, from **before** its transform,
 * while the bracket carries d3's pan and zoom on exactly that element. Cropping
 * to the raw box therefore points the viewBox at empty space and the picture
 * comes out blank - measured, and the reason this is a function of its own with
 * tests rather than three lines inlined somewhere.
 */
export const cropBox = (box: Box, transform: Transform | null, padding: number): Box => {
  const scaleX = transform?.a ?? 1
  const scaleY = transform?.d ?? 1

  return {
    x: box.x * scaleX + (transform?.e ?? 0) - padding,
    y: box.y * scaleY + (transform?.f ?? 0) - padding,
    width: box.width * scaleX + padding * 2,
    height: box.height * scaleY + padding * 2,
  }
}
