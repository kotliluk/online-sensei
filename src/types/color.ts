export type THexColor = string

/**
 * Returns true if the given string is in '#HHH' or '#HHH' format.
 */
export const isHexColor = (str: string): str is THexColor => {
  return /^#([0-9a-f]{3}){1,2}$/i.test(str)
}

/**
 * Returns black or white color to contrast with the given color.
 *
 * Credit: https://stackoverflow.com/a/35970186
 */
export const getContrastColor = (color: THexColor): THexColor => {
  color = color.slice(1)
  // convert 3-digit hex to 6-digits
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
  }

  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#ffffff'
}
