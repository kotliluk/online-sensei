import { Predicate } from '../utils/function'


export const isBetweenValidator = (x: number, y: number): Predicate<number> => {
  return (num: number) => x <= num && num <= y
}

export const isBetween = (num: number, x: number, y: number): boolean => {
  return x <= num && num <= y
}
