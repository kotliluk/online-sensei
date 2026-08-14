// Callers pass app-root-relative paths like 'audio/BEEP_A_100ms.mp3'. Resolving those
// against the current document would break on any route deeper than one segment
// (e.g. on /reactions/set-up they resolved to /reactions/audio/...), so they are
// anchored to the deployment base instead.
const audioUrl = (file: string): string => `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`

export const playAudio = (file: string, volume = 1): void => {
  const a = new Audio(audioUrl(file))
  a.volume = volume
  a.play().catch(console.error)
}

export const loadAudio = (file: string): void => {
  const a = new Audio(audioUrl(file))
  // TODO - fix loading in production
  // a.load()
  a.volume = 0
  a.play().catch(console.error)
}
