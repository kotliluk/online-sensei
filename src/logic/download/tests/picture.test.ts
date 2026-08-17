import { cropBox, PICTURE_MAX_SCALE, PICTURE_PIXEL_BUDGET, pictureScale } from '../picture'


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

describe('cropBox', () => {
  const box = { x: -500, y: -105, width: 600, height: 210 }

  test('follows the transform the bracket is panned by', () => {
    // arrange - the pan d3 applies to the root group, measured on a real bracket
    const matrix = { a: 1, d: 1, e: 800, f: 140 }
    // act
    const crop = cropBox(box, matrix, 0)
    // assert - without this the crop points at empty space and the picture comes out blank
    expect(crop).toEqual({ x: 300, y: 35, width: 600, height: 210 })
  })

  test('scales the box by the zoom as well as moving it', () => {
    // arrange
    const matrix = { a: 2, d: 2, e: 0, f: 0 }
    // act
    const crop = cropBox(box, matrix, 0)
    // assert
    expect(crop).toEqual({ x: -1000, y: -210, width: 1200, height: 420 })
  })

  test('adds the padding on every side', () => {
    // act
    const crop = cropBox(box, { a: 1, d: 1, e: 0, f: 0 }, 16)
    // assert
    expect(crop).toEqual({ x: -516, y: -121, width: 632, height: 242 })
  })

  test('copes with a bracket that carries no transform at all', () => {
    // act
    const crop = cropBox(box, null, 0)
    // assert
    expect(crop).toEqual(box)
  })
})
