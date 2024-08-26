export const range = (size: number): number[] => {
  return Array(size).fill(0).map((_, i) => i)
}

export const split = <T> (arr: T[]): [T[], T[]] => {
  const mid = Math.ceil(arr.length / 2)
  return [arr.slice(0, mid), arr.slice(mid)]
}

export const arrayOfDefined = <T> (...items: (T | null | undefined)[]): T[] => {
  return items.filter((i) => !!i) as T[]
}
