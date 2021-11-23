export const parseIntOrDefault = (str: string, defaultInt: number): number => {
  const parsed = Number.parseInt(str)
  return isNaN(parsed) ? defaultInt : parsed
}
