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
    sound: 'Sound',
    noSound: 'No sound',
    // user actions
    back: 'Back',
    finished: 'Finished',
    pause: 'Pause',
    paused: 'Paused',
    reset: 'Reset',
    resume: 'Resume',
    start: 'Start',
    stop: 'Stop',
    cancel: 'Cancel',
    save: 'Save',
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
    intervalTimer: {
      annotation: 'Prepare interval training with intervals as you need',
      link: 'Interval timer',
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
      tournament: {
        label: 'Tournament',
        newTournament: 'New tournament',
        name: 'Name',
        resumeTournament: 'Resume tournament',
        types: {
          label: 'System',
          tree: 'Tree',
          group: 'Skupina',
        },
        competitorsCount: {
          label: 'Competitors count',
          // 2 params
          error: 'Competitors count must be set between __{1}__ and __{2}__.',
        },
        shuffleCompetitors: 'Random draw',
        competitors: 'Competitors',
        repechage: 'Repechage',
        cancelTournamentModal: {
          title: 'Cancel tournament',
          text: 'Do you really want to cancel the tournament? All results will be lost.',
        },
        fightResultModal: {
          title: 'Save fight in tournament',
          text: 'Select the winner',
          draw: 'Draw',
        },
        tableStatsLabels: {
          win: 'W',
          draw: 'D',
          loss: 'L',
        },
      },
    },
    timerScreen: {
      saveTournamentFight: 'Save fight',
    },
  },
  intervalTimer: {
    setUpScreenSimple: {
      heading: 'Interval timer',
      rounds: {
        label: 'Rounds',
        // 2 params
        error: 'Rounds must be set between __{1}__ and __{2}__.',
      },
      workInterval: {
        label: 'Work interval (s)',
        // 2 params
        error: 'Work interval must be set between __{1}__ and __{2}__.',
      },
      pauseInterval: {
        label: 'Pause interval (s)',
        // 2 params
        error: 'Pause interval must be set between __{1}__ and __{2}__.',
      },
      skipLastPause: {
        label: 'Skip last pause',
      },
      advancedSettingsBtn: 'Advanced settings',
    },
    setUpScreenAdvanced: {
      heading: 'Interval timer',
      intervalInSeriesSubheading: 'Intervals in series',
      intervalInSeries: {
        type: {
          label: 'Type',
          work: 'Work',
          pause: 'Pause',
        },
        name: 'Name',
        duration: {
          label: 'Duration (s)',
          // 2 params
          error: 'Duration must be set between __{1}__ and __{2}__.',
        },
      },
      addIntervalInSeriesBtn: 'Add interval',
      loadSeries: 'Load series',
      noSeries: 'No saved series',
      saveSeries: 'Save series',
      seriesName: 'Name',
      duplicateSeriesNameError: 'Another series already has this name',
      series: {
        label: 'Series',
        // 2 params
        error: 'Series must be set between __{1}__ and __{2}__.',
      },
      skipLastPause: {
        label: 'Skip last pause',
      },
      basicSettingsBtn: 'Basic settings',
    },
    playScreen: {
      heading: 'Interval timer',
      work: 'Work',
    },
  },
}
