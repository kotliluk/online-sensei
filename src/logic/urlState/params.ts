import { Predicate } from '../../utils/function'


/**
 * Helpers for putting a set-up state into a shareable link and reading it back.
 *
 * Everything coming out of a URL is untrusted, so each field is read on its own
 * and falls back to the given default when it is missing or does not pass the
 * feature's existing validator. A single broken parameter therefore degrades
 * that one field instead of invalidating the whole link.
 *
 * Writing is the mirror image: a value equal to the default is left out, which
 * keeps the links short. Because of that, decoding must always be given the
 * app defaults - not the recipient's stored settings - otherwise an omitted
 * (because default) value of the sender would be filled in with whatever the
 * recipient happens to have stored, and the link would not reproduce the setup
 * that was shared.
 */

const LIST_SEPARATOR = ','
const FIELD_SEPARATOR = ';'

/** Escapes the separator (and the escape character itself) inside a list item. */
const escapeItem = (value: string, separator: string): string => {
  return value.replace(/\\/g, '\\\\').replace(new RegExp(separator, 'g'), '\\' + separator)
}

/** Splits on unescaped separators and unescapes the items. */
const splitEscaped = (value: string, separator: string): string[] => {
  const items: string[] = []
  let current = ''
  let escaped = false

  for (const char of value) {
    if (escaped) {
      current += char
      escaped = false
    } else if (char === '\\') {
      escaped = true
    } else if (char === separator) {
      items.push(current)
      current = ''
    } else {
      current += char
    }
  }
  items.push(current)

  return items
}

export const joinList = (items: string[]): string => {
  return items.map((item) => escapeItem(item, LIST_SEPARATOR)).join(LIST_SEPARATOR)
}

export const splitList = (value: string): string[] => {
  return splitEscaped(value, LIST_SEPARATOR)
}

export const joinFields = (fields: string[]): string => {
  return fields.map((field) => escapeItem(field, FIELD_SEPARATOR)).join(FIELD_SEPARATOR)
}

export const splitFields = (value: string): string[] => {
  return splitEscaped(value, FIELD_SEPARATOR)
}

/** ******************* Reading *********************/

export const readNumber = (
  params: URLSearchParams,
  key: string,
  isValid: Predicate<number>,
  fallback: number,
): number => {
  const raw = params.get(key)

  if (raw === null || raw.trim() === '') {
    return fallback
  }

  const value = Number(raw)

  return (Number.isFinite(value) && isValid(value)) ? value : fallback
}

export const readString = <T extends string>(
  params: URLSearchParams,
  key: string,
  isValid: Predicate<any>,
  fallback: T,
): T => {
  const raw = params.get(key)

  return (raw !== null && isValid(raw)) ? (raw as T) : fallback
}

export const readBoolean = (params: URLSearchParams, key: string, fallback: boolean): boolean => {
  const raw = params.get(key)

  if (raw === '1' || raw === 'true') {
    return true
  }
  if (raw === '0' || raw === 'false') {
    return false
  }

  return fallback
}

/**
 * Reads a list parameter, maps each item and keeps the result only when the
 * whole list passes the given validator.
 */
export const readList = <T>(
  params: URLSearchParams,
  key: string,
  parseItem: (item: string) => T | null,
  isValid: Predicate<T[]>,
  fallback: T[],
): T[] => {
  const raw = params.get(key)

  if (raw === null) {
    return fallback
  }

  const items = splitList(raw).map(parseItem)

  if (items.some((item) => item === null)) {
    return fallback
  }

  const parsed = items as T[]

  return isValid(parsed) ? parsed : fallback
}

/** ******************* Writing *********************/

/** Sets the parameter only when the value differs from the default. */
export const writeIfChanged = <T>(
  params: URLSearchParams,
  key: string,
  value: T,
  fallback: T,
  serialize: (value: T) => string = String,
): void => {
  if (serialize(value) !== serialize(fallback)) {
    params.set(key, serialize(value))
  }
}

export const serializeBoolean = (value: boolean): string => value ? '1' : '0'

/** Hex colours are stored with a leading '#', which would need escaping in a URL. */
export const serializeColor = (color: string): string => color.replace(/^#/, '')

export const parseColor = (value: string): string => `#${value.replace(/^#/, '')}`
