export const parseIntOrDefault = (str: string | null, defaultInt: number): number => {
  if (str === null) {
    return defaultInt
  }

  const parsed = Number.parseInt(str)
  return isNaN(parsed) ? defaultInt : parsed
}

export const intOrDefaultParser = (defInt: number) => (str: string | null): number => parseIntOrDefault(str, defInt)
