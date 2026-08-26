import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useData } from '../useData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const CURRENT_YEAR = String(new Date().getFullYear())

const BEACHES = [
  { name: 'Tortuga',   color: '#1a6b5f' },
  { name: 'Hermosa',   color: '#52b788' },
  { name: 'Dominical', color: '#e9c46a' },
]

export function BeachTrend({ src }) {
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_beach_year ?? []
  if (!rows.length) return null

  const years = [...new Set(rows.map(r => r.year))].sort()
  const lastYearIdx = years.length - 1

  const datasets = BEACHES.map(({ name, color }) => {
    const nestsByYear = years.map(yr => {
      const match = rows.find(r => r.beach === name && r.year === yr)
      return match ? match.nests : null
    })
    return {
      label: name,
      data: nestsByYear,
      borderColor: color,
      backgroundColor: color + '22',
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      // Dashed segment leading into the partial (current) year
      segment: {
        borderDash: ctx => ctx.p1DataIndex === lastYearIdx ? [5, 4] : undefined,
      },
      spanGaps: true,
    }
  })

  const hasPartial = years.includes(CURRENT_YEAR)

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: 'Nests per Year by Beach' },
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          title: ctx => {
            const yr = ctx[0].label
            return yr === CURRENT_YEAR ? `${yr} (partial year)` : yr
          },
        },
      },
    },
    scales: {
      x: {},
      y: { beginAtZero: true, title: { display: true, text: 'Nests' } },
    },
  }

  return (
    <div style={styles.wrap}>
      <Line data={{ labels: years, datasets }} options={options} />
      {hasPartial && (
        <p style={styles.note}>
          Dashed line segment = {CURRENT_YEAR} (partial year — season in progress).
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
