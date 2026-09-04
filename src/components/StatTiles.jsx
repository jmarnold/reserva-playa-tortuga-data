import React from 'react'
import { useSeasonData } from '../useSeasonData'
import { CURRENT_YEAR, START_YEAR, SEASON_YEARS } from '../seasonFilter'

export function StatTiles({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const totalNests = data.total_nests ?? 0
  const totalEggs = data.total_eggs ?? 0
  const beachRows = data.by_beach ?? []
  const speciesSet = new Set(beachRows.map(r => r.species).filter(s => s !== 'Unknown'))
  const speciesCount = speciesSet.size

  // Poaching rate for the most recent complete year
  const yearRows = data.by_year ?? []
  const completeYears = yearRows.filter(r => r.year !== CURRENT_YEAR)
  const lastComplete = completeYears.reduce(
    (best, r) => r.year > best.year ? r : best,
    { year: '0', nests: 0, poached: 0 }
  )
  const poachDenom = lastComplete.nests + lastComplete.poached
  const poachRate = poachDenom > 0 ? lastComplete.poached / poachDenom : 0
  const poachPct = (poachRate * 100).toFixed(1)
  const poachColor = poachRate > 0.10 ? '#e76f51' : poachRate > 0.05 ? '#c08a00' : '#2a9d8f'

  // Nests this season: May–Nov of the latest season year with data
  const monthData = data.nest_vs_poached_by_month ?? []
  const seasonYear = monthData
    .filter(r => { const mo = parseInt(r.month.split('-')[1], 10); return mo >= 5 && mo <= 11 })
    .map(r => r.month.split('-')[0])
    .sort()
    .pop() ?? CURRENT_YEAR
  const nestsThisSeason = monthData
    .filter(r => {
      const [y, mo] = r.month.split('-')
      return y === seasonYear && parseInt(mo, 10) >= 5 && parseInt(mo, 10) <= 11
    })
    .reduce((sum, r) => sum + r.nests, 0)

  const seasonLabel = START_YEAR === CURRENT_YEAR ? CURRENT_YEAR : `${START_YEAR}–${CURRENT_YEAR}`

  const tiles = [
    { label: `Nests (${seasonLabel})`, value: totalNests.toLocaleString(), icon: '🐢', color: '#2a9d8f' },
    { label: `Eggs (${seasonLabel})`, value: totalEggs.toLocaleString(), icon: '🥚', color: '#2a9d8f' },
    { label: 'Species', value: speciesCount, icon: '🌊', color: '#2a9d8f' },
    {
      label: `Poaching rate ${lastComplete.year}`,
      value: `${poachPct}%`,
      icon: '⚠️',
      color: poachColor,
    },
    {
      label: `Nests this season (${seasonYear})`,
      value: nestsThisSeason.toLocaleString(),
      icon: '📍',
      color: '#2a9d8f',
    },
  ]

  return (
    <div style={styles.grid}>
      {tiles.map(t => (
        <div key={t.label} style={styles.tile}>
          <div style={styles.icon}>{t.icon}</div>
          <div style={{ ...styles.value, color: t.color }}>{t.value}</div>
          <div style={styles.label}>{t.label}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    fontFamily: 'sans-serif',
    padding: '8px',
  },
  tile: {
    flex: '1 1 100px',
    background: '#f0faf9',
    border: '1px solid #2a9d8f33',
    borderRadius: '8px',
    padding: '14px 10px',
    textAlign: 'center',
    minWidth: 0,
  },
  icon: { fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: '6px' },
  value: { fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700 },
  label: { fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#555', marginTop: '4px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
