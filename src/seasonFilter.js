export const CURRENT_YEAR = String(new Date().getFullYear())
export const START_YEAR = '2022'
export const SEASON_YEARS = Array.from(
  { length: Number(CURRENT_YEAR) - Number(START_YEAR) + 1 },
  (_, i) => String(Number(START_YEAR) + i)
)

export function filterToSeasons(data) {
  if (!data) return data
  const yrs = new Set(SEASON_YEARS)
  const monthInYears = r => yrs.has(r.month?.split('-')[0])

  const byYear = (data.by_year ?? []).filter(r => yrs.has(r.year))

  return {
    ...data,
    total_nests: byYear.reduce((s, r) => s + r.nests, 0),
    total_eggs:  byYear.reduce((s, r) => s + r.eggs, 0),
    by_year:               byYear,
    by_month:              (data.by_month              ?? []).filter(monthInYears),
    by_species_month:      (data.by_species_month      ?? []).filter(monthInYears),
    by_beach_year:         (data.by_beach_year         ?? []).filter(r => yrs.has(r.year)),
    by_beach_month:        (data.by_beach_month        ?? []).filter(monthInYears),
    by_activity_month:     (data.by_activity_month     ?? []).filter(monthInYears),
    nest_vs_poached_by_month: (data.nest_vs_poached_by_month ?? []).filter(monthInYears),
    // by_beach and by_species carry no year field — passed through unchanged
  }
}
