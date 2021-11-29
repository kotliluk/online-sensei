import { Translation } from './translation'


export const EN: Translation = {
  language: 'English',
  languageShort: 'EN',
  common: {
    darkTheme: 'Dark theme',
    lightTheme: 'Light theme',
    language: 'Language',
    // user actions
    back: 'Back',
    finished: 'Finished',
    pause: 'Pause',
    paused: 'Paused',
    reset: 'Reset',
    resume: 'Resume',
    start: 'Start',
    stop: 'Stop',
  },
  mainPage: {
    appIntroduction: 'Train alone or with friends with OnlineSensei!',
    availableFeatures: 'Available features',
    reactions: {
      annotation: 'Train your reactions with customizable timer with random signals',
      link: 'Reactions',
    },
    kumiteTimer: {
      annotation: 'Take your friend for kumite fight with easy-to-use kumite timer',
      link: 'Kumite timer',
    },
  },
  reactions: {
    setUpScreen: {
      heading: 'Reactions',
      rounds: {
        label: 'Rounds',
        // 2 params
        error: 'Rounds must be set between __{1}__ and __{2}__.',
      },
      signalDuration: {
        label: 'Signal duration (ms)',
        // 2 params
        error: 'Signal duration must be set between __{1}__ and __{2}__.',
      },
      minInterval: {
        label: 'Minimal interval (ms)',
        // 2 params
        error: 'Minimal interval must be set between __{1}__ and __{2}__.',
        rangeError: 'Minimal interval must be less or equal to maximal.',
      },
      maxInterval: {
        label: 'Maximal interval (ms)',
        // 2 params
        error: 'Maximal interval must be set between __{1}__ and __{2}__.',
        rangeError: 'Maximal interval must be greater or equal to minimal.',
      },
      signalColor: {
        label: 'Signal color',
      },
      sound: {
        label: 'Sound',
        noAudio: 'No audio',
      },
    },
    playScreen: {
      heading: 'Reactions',
      round: 'Round',
    },
  },
}
