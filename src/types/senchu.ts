export type Senchu = 'NONE' | 'RED' | 'BLUE'

export const switchSenchu = (senchu: Senchu): Senchu => {
  if (senchu === 'RED') {
    return 'BLUE'
  }

  return senchu === 'BLUE' ? 'RED' : 'NONE'
}
