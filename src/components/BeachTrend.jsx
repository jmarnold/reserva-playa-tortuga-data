import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useSeasonData } from '../useSeasonData'
import { CURRENT_YEAR } from '../seasonFilter'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(ym) {
  const [y, m] = ym.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} '${y.slice(2)}`
}

const BEACHES = [
  { name: 'Tortuga', color: '#1a6b5f' },
  { name: 'Hermosa', color: '#52b788' },
]

export function BeachTrend({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_beach_month ?? []
  if (!rows.length) return null

  const months = [...new Set(rows.map(r => r.month))].sort()
  const lastIdx = months.length - 1
  const isCurrentYear = mo => mo.startsWith(CURRENT_YEAR)

  const datasets = BEACHES.map(({ name, color }) => ({
    label: name,
    data: months.map(mo => {
      const match = rows.find(r => r.beach === name && r.month === mo)
      return match ? match.nests : null
    }),
    borderColor: color,
    backgroundColor: color + '22',
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 6,
    segment: {
      borderDash: ctx => isCurrentYear(months[ctx.p1DataIndex]) ? [5, 4] : undefined,
    },
    spanGaps: true,
  }))

  const hasPartial = months.some(isCurrentYear)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: 'Nests per Month by Beach' },
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          title: ctx => {
            const mo = months[ctx[0].dataIndex]
            return isCurrentYear(mo)
              ? `${fmtMonth(mo)} (season in progress)`
              : fmtMonth(mo)
          },
        },
      },
    },
    scales: {
      x: {
        labels: months.map(fmtMonth),
        ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 18 },
      },
      y: { beginAtZero: true, title: { display: true, text: 'Nests' } },
    },
  }

  return (
    <div style={styles.wrap}>
      <Line data={{ labels: months.map(fmtMonth), datasets }} options={options} />
      {hasPartial && (
        <p style={styles.note}>
          Dashed segments = {CURRENT_YEAR} (season in progress).
        </p>
      )}
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px', height: 'clamp(260px, 38vh, 400px)' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
  note: { fontSize: '0.75rem', color: '#888', margin: '4px 8px 0' },
}
