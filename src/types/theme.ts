export type Theme = 'light' | 'dark'

export const isThemeType = (value: any): boolean => {
  return value === 'light' || value === 'dark'
}
