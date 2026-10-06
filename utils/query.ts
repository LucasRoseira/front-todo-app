export function cleanQuery(input: Record<string, unknown>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string | number>
}
