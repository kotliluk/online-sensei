export type Senchu = 'NONE' | 'RED' | 'BLUE'

const LS_PREFIX = 'KUMITE_TIMER__SYNC__'

export const LS_KEYS = {
  time: `${LS_PREFIX}TIME`,
  scoreRed: `${LS_PREFIX}SCORE_RED`,
  foulsRed: `${LS_PREFIX}FOULS__RED`,
  scoreBlue: `${LS_PREFIX}SCORE_BLUE`,
  foulsBlue: `${LS_PREFIX}FOULS__BLUE`,
  senchu: `${LS_PREFIX}SENCHU`,
}
