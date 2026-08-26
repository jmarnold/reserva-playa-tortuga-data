import React from 'react'
import { useData } from '../useData'

export function StatTiles({ src }) {
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const totalNests = data.total_nests ?? 0
  const rows = data.by_beach ?? []
  const totalEggs = rows.reduce((sum, r) => sum + (r.eggs ?? 0), 0)
  const speciesSet = new Set(rows.map(r => r.species).filter(s => s !== 'Unknown'))
  const speciesCount = speciesSet.size

  const tiles = [
    { label: 'Total Nests', value: totalNests.toLocaleString(), icon: '🐢' },
    { label: 'Total Eggs', value: totalEggs.toLocaleString(), icon: '🥚' },
    { label: 'Species', value: speciesCount, icon: '🌊' },
  ]

  return (
    <div style={styles.grid}>
      {tiles.map(t => (
        <div key={t.label} style={styles.tile}>
          <div style={styles.icon}>{t.icon}</div>
          <div style={styles.value}>{t.value}</div>
          <div style={styles.label}>{t.label}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    fontFamily: 'sans-serif',
    padding: '8px',
  },
  tile: {
    flex: '1 1 120px',
    background: '#f0faf9',
    border: '1px solid #2a9d8f33',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  icon: { fontSize: '2rem', marginBottom: '8px' },
  value: { fontSize: '2rem', fontWeight: 700, color: '#2a9d8f' },
  label: { fontSize: '0.85rem', color: '#555', marginTop: '4px' },
}
