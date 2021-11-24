export type Func<T = void> = () => T

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const emptyFunc: Func = () => {}
