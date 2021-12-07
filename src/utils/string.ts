/**
 * Removes double-quotes from start and end if they are on both sides.
 */
export const unquote = (str: string): string => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1)
  }
  return str
}
