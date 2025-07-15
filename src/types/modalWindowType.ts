export type ModalWindowType = 'NONE' | 'LOAD_ADVANCED_SERIES' | 'SAVE_ADVANCED_SERIES' | 'CANCEL_TOURNAMENT'
| 'FIGHT_RESULT' | 'REOPEN_TREE_FIGHT'

export const isValidModalWindowType = (x: any): x is ModalWindowType => {
  return x === 'NONE' || x === 'LOAD_ADVANCED_SERIES' || x === 'SAVE_ADVANCED_SERIES'
    || x === 'CANCEL_TOURNAMENT' || x === 'FIGHT_RESULT_MODAL' || x === 'REOPEN_TREE_FIGHT'
}
