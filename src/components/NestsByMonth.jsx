import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useSeasonData } from '../useSeasonData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function NestsByMonth({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_month ?? []
  const labels = rows.map(r => r.month)
  const counts = rows.map(r => r.nests)

  const chartData = {
    labels,
    datasets: [{
      label: 'Nests',
      data: counts,
      backgroundColor: '#2a9d8f',
      borderRadius: 4,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Nests per Month' },
    },
    scales: {
      x: { ticks: { maxRotation: 45 } },
    },
  }

  return (
    <div style={styles.wrap}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
