export const playAudio = (file: string, volume = 1): void => {
  const a = new Audio(file)
  a.volume = volume
  a.play().catch(console.error)
}

export const loadAudio = (file: string): void => {
  const a = new Audio(file)
  // TODO - fix loading in production
  // a.load()
  a.volume = 0
  a.play().catch(console.error)
}
