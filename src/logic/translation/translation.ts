/**
 * App translation.
 */
import { Language } from './index'


export interface Translation {
  language: string
  languageShort: Language
  common: {
    darkTheme: string,
    lightTheme: string,
    language: string,
    // user actions
    back: string,
    finished: string,
    pause: string,
    paused: string,
    reset: string,
    resume: string,
    start: string,
    stop: string,
  }
  mainPage: {
    appIntroduction: string,
    availableFeatures: string,
    reactions: {
      annotation: string,
      link: string,
    },
    kumiteTimer: {
      annotation: string,
      link: string,
    },
  }
  reactions: {
    setUpScreen: {
      heading: string,
      rounds: {
        label: string,
        // 2 params
        error: string,
      },
      signalDuration: {
        label: string,
        // 2 params
        error: string,
      },
      minInterval: {
        label: string,
        // 2 params
        error: string,
        rangeError: string,
      },
      maxInterval: {
        label: string,
        // 2 params
        error: string,
        rangeError: string,
      },
      signalCount: {
        label: string,
      },
      signalColor: {
        label: string,
      },
      sound: {
        label: string,
        noAudio: string,
      },
    },
    playScreen: {
      heading: string,
      round: string,
    },
  }
}
