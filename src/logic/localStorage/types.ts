import { Func } from '../../utils/function'


/**
 * Mapper object of type properties to their local storage keys.
 */
export type LSMapper<T extends {}> = {
  [K in keyof T]?: string
}

/**
 * Access wrapper object of type properties to local storage.
 */
export type LSAccessWrapper<T extends {}> = {
  [K in keyof T]: {
    get: Func<T[K]>,
    set: (value: T[K]) => void,
  }
}
