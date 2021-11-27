/**
 * Returns true if the given string is in '#HHH' or '#HHH' format.
 */
export const isHexColor = (str: string): boolean => {
  return /^#([0-9a-f]{3}){1,2}$/i.exec(str) !== null
}
