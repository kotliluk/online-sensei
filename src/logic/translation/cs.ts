import { Translation } from './translation'


export const CS: Translation = {
  language: 'Česky',
  languageShort: 'CS',
  common: {
    darkTheme: 'Tmavý motiv',
    lightTheme: 'Světlý motiv',
    language: 'Jazyk',
    time: 'Čas',
    fight: 'Zápas',
    sound: 'Zvuk',
    noSound: 'Žádný zvuk',
    // user actions
    back: 'Zpět',
    finished: 'Hotovo',
    pause: 'Pauza',
    paused: 'Pozastaveno',
    reset: 'Reset',
    resume: 'Pokračovat',
    start: 'Start',
    stop: 'Stop',
    cancel: 'Zrušit',
    save: 'Uložit',
    share: 'Sdílet',
    shareCopied: 'Odkaz s aktuálním nastavením byl zkopírován do schránky',
    shareFailed: 'Odkaz se nepodařilo zkopírovat do schránky',
    downloadCsv: 'Stáhnout CSV',
    shareCsv: 'Sdílet CSV',
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
    intervalTimer: {
      annotation: 'Připrav si kruhový nebo intervalový trénink s přesně takovými intervaly, jak potřebuješ',
      link: 'Intervalové stopky',
    },
    groupStopwatch: {
      annotation: 'Zaznamenej si jednoduše čas všech svých kamarádů a porovnejte své výkony',
      link: 'Skupinové stopky',
    },
  },
  groupStopwatch: {
    setUpScreen: {
      heading: 'Skupinové stopky',
      competitorsCount: {
        label: 'Počet závodníků',
        // 2 params
        error: 'Počet účastníků musí být mezi __{1}__ a __{2}__.',
      },
      competitors: {
        label: 'Závodníci',
      },
    },
    playScreen: {
      results: 'Výsledky',
      name: 'Jméno',
      time: 'Čas',
      place: 'Pořadí',
    },
  },
  reactions: {
    setUpScreen: {
      heading: 'Reakce',
      rounds: {
        label: 'Kola',
        // 2 params
        error: 'Kol musí být mezi __{1}__ a __{2}__.',
      },
      signalDuration: {
        label: 'Délka signálu (ms)',
        // 2 params
        error: 'Délka signálu musí být mezi __{1}__ a __{2}__ ms.',
      },
      minInterval: {
        label: 'Minimální interval (ms)',
        // 2 params
        error: 'Minimální délka intervalu musí být mezi __{1}__ a __{2}__ ms.',
        rangeError: 'Minimální interval nesmí být větší než maximální.',
      },
      maxInterval: {
        label: 'Maximální interval (ms)',
        // 2 params
        error: 'Maximální délka intervalu musí být mezi __{1}__ a __{2}__ ms.',
        rangeError: 'Maximální interval nesmí být menší než minimální.',
      },
      signalCount: {
        label: 'Počet terčů',
      },
      signalColor: {
        label: 'Barva signálu',
      },
    },
    playScreen: {
      heading: 'Reakce',
      round: 'Kolo',
    },
  },
  kumiteTimer: {
    setUpScreen: {
      heading: 'Kumite Časomíra',
      duration: {
        label: 'Délka zápasu (s)',
        // 2 params
        error: 'Délka zápasu musí být mezi __{1}__ a __{2}__.',
      },
      tournament: {
        label: 'Turnaj',
        newTournament: 'Nový turnaj',
        name: 'Název',
        resumeTournament: 'Pokračovat turnaj',
        types: {
          label: 'Systém',
          tree: 'Pavouk',
          group: 'Skupina',
        },
        competitorsCount: {
          label: 'Počet závodníků',
          // 2 params
          error: 'Počet účastníků musí být mezi __{1}__ a __{2}__.',
        },
        shuffleCompetitors: 'Náhodně rozlosovat',
        competitors: 'Závodníci',
        repechage: 'Repasáž',
        cancelTournamentModal: {
          title: 'Zrušit turnaj',
          text: 'Opravdu si přejete zrušit turnaj? Veškeré výsledky budou ztraceny.',
        },
        fightResultModal: {
          title: 'Uložit zápas v turnaji',
          text: 'Vyberte vítěze',
          draw: 'Remíza',
        },
        tableStatsLabels: {
          win: 'V',
          draw: 'R',
          loss: 'P',
        },
        reopenTreeFightModal: {
          title: 'Znovu otevřít dokončený zápas',
          // eslint-disable-next-line @stylistic/max-len
          text: 'Opravdu chcete otevřít dokončený zápas? Následující zápasy a repasáž nebudou automaticky aktualizovány a tak mohou vzniknout nenávaznosti.',
          textSemifinal: 'Opravdu chcete otevřít dokončené semifinále? Repasáž bude resetována.',
          // eslint-disable-next-line @stylistic/max-len
          textRepechage: 'Opravdu chcete otevřít dokončený zápas repasáže? Následující zápasy nebudou automaticky aktualizovány a tak mohou vzniknout nenávaznosti.',
        },
      },
    },
    tournamentScreen: {
      export: {
        downloadLog: 'Stáhnout průběh',
        shareLog: 'Sdílet průběh',
        downloadOverview: 'Stáhnout přehled',
        shareOverview: 'Sdílet přehled',
        downloadPicture: 'Stáhnout obrázek',
        sharePicture: 'Sdílet obrázek',
        round: 'Kolo',
        final: 'Finále',
        semifinal: 'Semifinále',
        // 1 param - číslo kola
        nthRound: '__{1}__. kolo',
        // 1 param - číslo větve repasáže
        repechageLine: 'Repasáž __{1}__',
        // 1 param - roh
        points: 'Body __{1}__',
        winner: 'Vítěz',
      },
    },
    timerScreen: {
      saveTournamentFight: 'Uložit zápas',
      leaveFightModal: {
        title: 'Neuložený zápas',
        text: 'Opravdu odejít bez uložení?',
        confirm: 'Odejít bez uložení',
      },
      export: {
        tournament: 'Turnaj',
        // sekundy, ne 2:00 - tabulkový procesor by si z toho udělal hodiny a minuty
        remaining: 'Zbývá (s)',
        type: 'Typ',
        side: 'Strana',
        value: 'Hodnota',
        description: 'Popis',
        // 1 param - roh
        finalPoints: 'Výsledné __{1}__ body',
        // 1 param - roh
        finalFouls: 'Výsledné __{1}__ fauly',
        finalSenchu: 'Výsledné senchu',
      },
      log: {
        toggle: 'Průběh zápasu',
        empty: 'Zatím se nic nestalo.',
        start: 'Začátek zápasu',
        pause: 'Pauza',
        resume: 'Pokračování',
        reset: 'Reset zápasu',
        end: 'Konec zápasu',
        // 2 params
        reopen: 'Znovuotevření zápasu (__{1}__:__{2}__)',
        // 3 params
        fouls: '__{1}__ fauly __{2}__ → __{3}__',
        // 1 param
        senchu: 'Senchu: __{1}__',
        senchuNone: 'zrušeno',
        // 2 params
        time: 'Čas __{1}__ → __{2}__',
      },
    },
  },
  intervalTimer: {
    setUpScreenSimple: {
      heading: 'Intervalové stopky',
      rounds: {
        label: 'Počet kol',
        // 2 params
        error: 'Počet kol musí být mezi __{1}__ a __{2}__.',
      },
      workInterval: {
        label: 'Zátěž (s)',
        // 2 params
        error: 'Zátěž musí být mezi __{1}__ a __{2}__.',
      },
      pauseInterval: {
        label: 'Pauza (s)',
        // 2 params
        error: 'Pauza musí být mezi __{1}__ a __{2}__.',
      },
      skipLastPause: {
        label: 'Přeskočit poslední pauzu',
      },
      advancedSettingsBtn: 'Pokročilé nastavení',
    },
    setUpScreenAdvanced: {
      heading: 'Intervalové stopky',
      intervalInSeriesSubheading: 'Intervaly v sérii',
      intervalInSeries: {
        type: {
          label: 'Typ',
          work: 'Zátěž',
          pause: 'Pauza',
        },
        name: 'Název',
        duration: {
          label: 'Délka (s)',
          // 2 params
          error: 'Délka musí být mezi __{1}__ a __{2}__.',
        },
      },
      addIntervalInSeriesBtn: 'Přidat interval',
      loadSeries: 'Nahrát sérii',
      noSeries: 'Žádné uložené série',
      saveSeries: 'Uložit sérii',
      seriesName: 'Název',
      duplicateSeriesNameError: 'Dané jméno již má jiná série',
      series: {
        label: 'Počet sérií',
        // 2 params
        error: 'Počet sérií musí být mezi __{1}__ a __{2}__.',
      },
      skipLastPause: {
        label: 'Přeskočit poslední pauzu',
      },
      basicSettingsBtn: 'Základní nastavení',
    },
    playScreen: {
      heading: 'Intervalové stopky',
      work: 'Zátěž',
    },
  },
}
