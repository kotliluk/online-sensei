import { padBox, PICTURE_MAX_SCALE, PICTURE_PIXEL_BUDGET, pictureScale } from '../picture'


describe('pictureScale', () => {
  test.each([
    // measured sizes of a real bracket, in css pixels, from 4 up to the app's own ceiling
    { name: '4 competitors', width: 632, height: 242, expected: 2 },
    { name: '8 competitors', width: 1032, height: 662, expected: 2 },
    { name: '16 competitors', width: 1432, height: 1502, expected: 2 },
  ])('draws $name at full resolution', ({ width, height, expected }) => {
    // act & assert
    expect(pictureScale(width, height)).toBe(expected)
  })

  test.each([
    { name: '32 competitors', width: 1832, height: 3182 },
    { name: '64 competitors', width: 2232, height: 6542 },
  ])('scales $name down instead of overrunning the canvas', ({ width, height }) => {
    // act
    const scale = pictureScale(width, height)
    // assert - the point is the area, not the factor
    expect(scale).toBeLessThan(PICTURE_MAX_SCALE)
    expect(width * scale * height * scale).toBeLessThanOrEqual(PICTURE_PIXEL_BUDGET)
  })

  test('never asks for more than it was told to', () => {
    // act & assert - a tiny picture is not blown up to fill the budget
    expect(pictureScale(10, 10)).toBe(PICTURE_MAX_SCALE)
  })

  test('lands exactly on the budget when it has to shrink', () => {
    // arrange - twice the budget in area
    const width = 4000
    const height = PICTURE_PIXEL_BUDGET * 2 / 4000
    // act
    const scale = pictureScale(width, height)
    // assert
    expect(width * scale * height * scale).toBeCloseTo(PICTURE_PIXEL_BUDGET, 0)
  })

  test('has an answer for a tournament with nothing in it', () => {
    // act & assert - no content means no reason to shrink anything
    expect(pictureScale(0, 0)).toBe(PICTURE_MAX_SCALE)
  })
})

describe('padBox', () => {
  const box = { x: -500, y: -105, width: 600, height: 210 }

  test('leaves room on every side', () => {
    // act
    const padded = padBox(box, 16)
    // assert - the origin moves back by the padding and the size grows by twice it
    expect(padded).toEqual({ x: -516, y: -121, width: 632, height: 242 })
  })

  test('is the box itself when nothing is asked for', () => {
    // act & assert
    expect(padBox(box, 0)).toEqual(box)
  })
})
