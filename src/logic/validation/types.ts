import { Predicate } from '../../utils/function'


export type Validator<T extends {}> = {
  [K in keyof T]: Predicate<T[K]>
}

export type Bounds = {
  min: number,
  max: number,
}

/**
 * Min and max boundaries for all number keys of given type.
 */
export type Limits<T extends {}> = {
  [K in keyof T as T[K] extends number ? K : never]-?: Bounds
}
