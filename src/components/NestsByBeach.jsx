import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useData } from '../useData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SPECIES_COLORS = {
  'Lora /Olive ridley': '#2a9d8f',
  'Verde/Green':        '#e9c46a',
  'Carey/Hawksbill':    '#f4a261',
  'Unknown':            '#adb5bd',
}

export function NestsByBeach({ src }) {
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_beach ?? []

  // Collect unique beaches and species
  const beaches = [...new Set(rows.map(r => r.beach))]
  const species = [...new Set(rows.map(r => r.species))]

  const datasets = species.map(sp => ({
    label: sp,
    backgroundColor: SPECIES_COLORS[sp] ?? '#6c757d',
    data: beaches.map(b => {
      const match = rows.find(r => r.beach === b && r.species === sp)
      return match ? match.nests : 0
    }),
    borderRadius: 4,
  }))

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Nests by Beach & Species (all seasons)' },
    },
    scales: { x: { stacked: false }, y: { stacked: false } },
  }

  return (
    <div style={styles.wrap}>
      <Bar data={{ labels: beaches, datasets }} options={options} />
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
