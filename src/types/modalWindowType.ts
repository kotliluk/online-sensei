export type ModalWindowType = 'NONE' | 'LOAD_ADVANCED_SERIES' | 'SAVE_ADVANCED_SERIES' | 'CANCEL_TOURNAMENT'
| 'FIGHT_RESULT_MODAL'

export const isValidModalWindowType = (x: any): boolean => {
  return x === 'NONE' || x === 'LOAD_ADVANCED_SERIES' || x === 'SAVE_ADVANCED_SERIES'
    || x === 'CANCEL_TOURNAMENT' || x === 'FIGHT_RESULT_MODAL'
}
