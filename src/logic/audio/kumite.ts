import { loadAudio, playAudio } from './player'


export const preloadKumiteAudio = (): void => {
  loadAudio('audio/ATOSHIBARAKU.mp3')
  loadAudio('audio/SIGNAL_END.mp3')
}

export const playAtoshibaraku = (): void => {
  playAudio('audio/ATOSHIBARAKU.mp3', 1)
}

export const playSignalEnd = (): void => {
  playAudio('audio/SIGNAL_END.mp3', 1)
}
