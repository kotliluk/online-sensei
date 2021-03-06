export type ModalWindowType = 'NONE' | 'LOAD_ADVANCED_SERIES' | 'SAVE_ADVANCED_SERIES'

export const isValidModalWindowType = (x: any): boolean => {
  return x === 'NONE' || x === 'LOAD_ADVANCED_SERIES' || x === 'SAVE_ADVANCED_SERIES'
}
