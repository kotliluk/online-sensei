import { loadAudio, playAudio } from './player'
import { BEEP_DURATIONS, BeepType, getPreferredDuration, NO_BEEP } from '../../types/beepType'


export const playBeep = (beepType: BeepType, preferredMaxDuration: number, volume = 1): void => {
  if (beepType === NO_BEEP) {
    return
  }

  playAudio(`audio/${beepType}_${getPreferredDuration(beepType, preferredMaxDuration)}ms.mp3`, volume)
}

export const preloadBeep = (beepType: BeepType): void => {
  BEEP_DURATIONS[beepType].forEach(duration => loadAudio(`audio/${beepType}_${duration}ms.mp3`))
}
