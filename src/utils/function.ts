export type Func<T = void> = () => T


export const emptyFunc: Func = () => {}

export type Predicate<T> = (value: T) => boolean
