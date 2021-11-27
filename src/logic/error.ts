/**
 * Joins given message-validity pairs into string. When all pairs are valid, returns undefined.
 */
export const joinErrorMessages = (messages: [string, boolean][]): string | undefined => {
  let ret = ''
  messages.forEach(([msg, valid]) => {
    if (!valid) {
      if (ret.length > 0) {
        ret += '\n'
      }
      ret += msg
    }
  })
  return ret.length > 0 ? ret : undefined
}
