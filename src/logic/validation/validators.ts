import { Predicate } from '../../utils/function'
import { Bounds } from './types'


export const isBetweenValidator = (bounds: Bounds): Predicate<number> => {
  return (num: number) => bounds.min <= num && num <= bounds.max
}

export const isBetween = (num: number, x: number, y: number): boolean => {
  return x <= num && num <= y
}

export const anythingIsValid = <T>(_: T): boolean => true

export const isValidArrayOf = <T> (validator: (item: T) => boolean): Predicate<T[]> => {
  // whatever `JSON.parse` returned is handed straight to this, so the argument is only an
  // array if the saved value happened to be one - a stored `5` would otherwise throw
  return (arr: T[]) => Array.isArray(arr) && arr.every(validator)
}
