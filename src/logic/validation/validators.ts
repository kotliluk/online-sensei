import { Predicate } from '../../utils/function'
import { Bounds } from './types'


export const isBetweenValidator = (bounds: Bounds): Predicate<number> => {
  return (num: number) => bounds.min <= num && num <= bounds.max
}

export const isBetween = (num: number, x: number, y: number): boolean => {
  return x <= num && num <= y
}

export const anythingIsValid = <T extends unknown>(_: T): boolean => true
