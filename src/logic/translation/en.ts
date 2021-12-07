import { Translation } from './translation'


export const EN: Translation = {
  language: 'English',
  languageShort: 'EN',
  common: {
    darkTheme: 'Dark theme',
    lightTheme: 'Light theme',
    language: 'Language',
    time: 'Time',
    fight: 'Fight',
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
      signalCount: {
        label: 'Signal boxes count',
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
  kumiteTimer: {
    setUpScreen: {
      heading: 'Kumite Timer',
      duration: {
        label: 'Fight duration (s)',
        // 2 params
        error: 'Duration must be set between __{1}__ and __{2}__.',
      },
      atoshibaraku: {
        label: 'Atoshibaraku (s)',
        // 2 params
        error: 'Atoshibaraku must be set between __{1}__ and __{2}__.',
      },
    },
    playScreen: {
      heading: 'Kumite Timer',
      switchSides: 'Switch sides',
    },
  },
}
