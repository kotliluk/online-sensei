/**
 * Returns random integer from range <min, max). If min = max, returns min.
 *
 * @param min inclusive lower bound
 * @param max exclusive upper bound
 */
export const getRandomInt = (min: number, max: number): number => {
  if (min === max) {
    return min
  }

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}
