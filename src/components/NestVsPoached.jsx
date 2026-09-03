import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useSeasonData } from '../useSeasonData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtMonth(ym) {
  const [y, m] = ym.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} '${y.slice(2)}`
}

export function NestVsPoached({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.nest_vs_poached_by_month ?? []
  if (!rows.length) return null

  const labels = rows.map(r => fmtMonth(r.month))

  // Flag high-pressure months: poached / (nests + poached) > 15%
  const isHighPressure = rows.map(r => {
    const total = r.nests + r.poached
    return total > 0 && r.poached / total > 0.15
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nests documented',
        data: rows.map(r => r.nests),
        borderColor: '#2a9d8f',
        backgroundColor: '#2a9d8f22',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Nests found poached',
        data: rows.map(r => r.poached),
        borderColor: '#e76f51',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        borderWidth: 2.5,
        // Enlarge points on high-pressure months
        pointRadius: isHighPressure.map(hp => hp ? 8 : 3),
        pointBackgroundColor: isHighPressure.map(hp => hp ? '#e76f51' : '#e76f51'),
        pointBorderColor: isHighPressure.map(hp => hp ? '#fff' : '#e76f51'),
        pointBorderWidth: isHighPressure.map(hp => hp ? 2 : 0),
        pointHoverRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: 'Nests Documented vs. Nests Found Poached (monthly)' },
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          afterBody: ctx => {
            const idx = ctx[0].dataIndex
            if (isHighPressure[idx]) return ['⚠ High-pressure month (>15% poaching rate)']
            return []
          },
        },
      },
    },
    scales: {
      x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 18 } },
      y: { beginAtZero: true, title: { display: true, text: 'Nests' } },
    },
  }

  const highPressureMonths = rows.filter((r, i) => isHighPressure[i]).map(r => fmtMonth(r.month))

  return (
    <div style={styles.wrap}>
      <Line data={chartData} options={options} />
      {highPressureMonths.length > 0 && (
        <p style={styles.note}>
          ⚠ Enlarged red points mark months where poaching exceeded 15% of total nest activity:&nbsp;
          {highPressureMonths.join(', ')}.
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
