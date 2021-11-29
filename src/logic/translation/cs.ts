import { Translation } from './translation'


export const CS: Translation = {
  language: 'Česky',
  languageShort: 'CS',
  common: {
    darkTheme: 'Tmavý motiv',
    lightTheme: 'Světlý motiv',
    language: 'Jazyk',
    // user actions
    back: 'Zpět',
    finished: 'Hotovo',
    pause: 'Pauza',
    paused: 'Pozastaveno',
    reset: 'Reset',
    resume: 'Pokračovat',
    start: 'Start',
    stop: 'Stop',
  },
  mainPage: {
    appIntroduction: 'Trénuj sám a nebo s přáteli s OnlineSensei!',
    availableFeatures: 'Dostupné funkce',
    reactions: {
      annotation: 'Trénuj své reakce s přizpůsobitelným časovačem s náhodnými signály',
      link: 'Reakce',
    },
    kumiteTimer: {
      annotation: 'Dej si s kamarádem kumite zápas díky jednoduché kumite časomíře',
      link: 'Kumite časomíra',
    },
  },
  reactions: {
    setUpScreen: {
      heading: 'Reakce',
      rounds: {
        label: 'Kola',
        // 2 params
        error: 'Musíš zvolit mezi __{1}__ a __{2}__ koly.',
      },
      signalDuration: {
        label: 'Délka signálu (ms)',
        // 2 params
        error: 'Délku signálu musíš zvolit mezi __{1}__ a __{2}__ ms.',
      },
      minInterval: {
        label: 'Minimální interval (ms)',
        // 2 params
        error: 'Minimální délku intervalu musíš zvolit mezi __{1}__ a __{2}__ ms.',
        rangeError: 'Minimální interval nesmí být větší než maximální.',
      },
      maxInterval: {
        label: 'Maximální interval (ms)',
        // 2 params
        error: 'Maximální délku intervalu musíš zvolit mezi __{1}__ a __{2}__ ms.',
        rangeError: 'Maximální interval nesmí být menší než minimální.',
      },
      signalCount: {
        label: 'Počet terčů',
      },
      signalColor: {
        label: 'Barva signálu',
      },
      sound: {
        label: 'Zvuk',
        noAudio: 'Žádný zvuk',
      },
    },
    playScreen: {
      heading: 'Reakce',
      round: 'Kolo',
    },
  },
}
