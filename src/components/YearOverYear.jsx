import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useData } from '../useData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CURRENT_YEAR = String(new Date().getFullYear())

function makeColors(rows, hex) {
  return rows.map(r => r.year === CURRENT_YEAR ? hex + '66' : hex)
}

export function YearOverYear({ src }) {
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_year ?? []
  if (!rows.length) return null

  const years = rows.map(r => r.year)
  const hasPartial = rows.some(r => r.year === CURRENT_YEAR)

  const datasets = [
    {
      label: 'Nests',
      data: rows.map(r => r.nests),
      backgroundColor: makeColors(rows, '#2a9d8f'),
      borderRadius: 4,
    },
    {
      label: 'False Crawls',
      data: rows.map(r => r.false_crawls),
      backgroundColor: makeColors(rows, '#4a8fa8'),
      borderRadius: 4,
    },
    {
      label: 'Poached',
      data: rows.map(r => r.poached),
      backgroundColor: makeColors(rows, '#e76f51'),
      borderRadius: 4,
    },
  ]

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Year-over-Year: Nests, False Crawls & Poaching' },
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          title: ctx => {
            const yr = ctx[0].label
            return yr === CURRENT_YEAR ? `${yr} (partial — season in progress)` : yr
          },
        },
      },
    },
    scales: {
      x: {},
      y: { beginAtZero: true, title: { display: true, text: 'Count' } },
    },
  }

  return (
    <div style={styles.wrap}>
      <Bar data={{ labels: years, datasets }} options={options} />
      {hasPartial && (
        <p style={styles.note}>
          Faded bars = {CURRENT_YEAR} (partial year — season still in progress).
        </p>
      )}
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
  note: { fontSize: '0.75rem', color: '#888', margin: '4px 8px 0' },
}
