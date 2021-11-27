export type Func<T = void> = () => T

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const emptyFunc: Func = () => {}

export type Predicate<T> = (value: T) => boolean
