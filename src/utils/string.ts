/**
 * Removes double-quotes from start and end if they are on both sides.
 */
export const unquote = (str: string): string => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1)
  }
  return str
}

/**
 * Parses string (removes quotes) from JSON string or returns undefined.
 */
export const parseStringOrUndefined = (str: string | null): string | null => {
  if (str === null || str === 'undefined') {
    return null
  }
  return unquote(str)
}
