export const NO_BEEP = 'NO_BEEP'
export const BEEP_A = 'BEEP_A'

export type BeepType = typeof NO_BEEP | typeof BEEP_A

export const BeepTypes = [NO_BEEP, BEEP_A] as const

type BeepDurations = {
  [T in BeepType]: number[]
}

export const BEEP_DURATIONS: BeepDurations = {
  NO_BEEP: [],
  BEEP_A: [100, 200, 300, 400, 500],
}

export const isBeepType = (value: any): boolean => {
  return BeepTypes.includes(value)
}

export const getPreferredDuration = (beepType: BeepType, preferred: number): number => {
  const durations = BEEP_DURATIONS[beepType]
  return durations.reduce((prev, curr) => curr < preferred ? curr : prev, durations[0])
}

export const getBeepName = (beepType: BeepType): string => {
  switch (beepType) {
    case 'NO_BEEP':
      return 'No beep'
    case 'BEEP_A':
      return 'Beep 1'
  }
}
