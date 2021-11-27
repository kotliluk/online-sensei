/**
 * Returns parsed number or null, if the key does not exist in local storage or is parsed to NaN.
 */
export const getNumberFromLS = (key: string): number | null => {
  const item = localStorage.getItem(key)

  if (item === null) {
    return null
  }

  const num = Number(item)
  return isNaN(num) ? null : num
}

export const getStringFromLS = (key: string): string | null => {
  return localStorage.getItem(key)
}

/**
 * Returns parsed number if the key exists in local storage and is parsed to non-NaN number.
 * If not, saved the given default value in local storage and returns it.
 */
export const getNumberFromLSOrDefault = (key: string, def: number): number => {
  const item = localStorage.getItem(key)
  const num = Number(item)

  if (item === null || isNaN(num)) {
    localStorage.setItem(key, def.toString())
    return def
  }

  return num
}

/**
 * Returns saved item if the key exists in local storage.
 * If not, saved the given default value in local storage and returns it.
 */
export const getStringFromLSOrDefault = (key: string, def: string): string => {
  const item = localStorage.getItem(key)

  if (item === null) {
    localStorage.setItem(key, def)
    return def
  }

  return item
}

export const saveToLS = (key: string, value: string | number): void => {
  localStorage.setItem(key, value.toString())
}
