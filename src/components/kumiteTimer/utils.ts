export type Senchu = 'NONE' | 'RED' | 'BLUE'

const LS_PREFIX = 'KUMITE_TIMER__SYNC__'

export const LS_KEYS = {
  time: `${LS_PREFIX}TIME`,
  scoreRed: `${LS_PREFIX}SCORE_RED`,
  foulsOneRed: `${LS_PREFIX}FOULS_ONE_RED`,
  foulsTwoRed: `${LS_PREFIX}FOULS_TWO_RED`,
  scoreBlue: `${LS_PREFIX}SCORE_BLUE`,
  foulsOneBlue: `${LS_PREFIX}FOULS_ONE_BLUE`,
  foulsTwoBlue: `${LS_PREFIX}FOULS_TWO_BLUE`,
  senchu: `${LS_PREFIX}SENCHU`,
}
