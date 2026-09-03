import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend, Title,
} from 'chart.js'
import { useSeasonData } from '../useSeasonData'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

// Shorten bilingual labels for display
const SHORT_LABELS = {
  'Nido/Nest': 'Nest',
  'Sálida Falsa/False crawl': 'False Crawl',
  'Anidación No efectivo /Not effective nesting': 'Not Effective',
  'Nido Saqueado/Poached nest': 'Poached',
  'Nido salvaje /Wild nest': 'Wild Nest',
  'Tortuga muerta/Dead turtle': 'Dead Turtle',
  'Tortuga Varada / Stranded turtle': 'Stranded',
}

const COLORS = ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#264653', '#adb5bd', '#6c757d']

export function ActivityBreakdown({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  // Aggregate activity counts from pre-built monthly summary
  const counts = {}
  for (const row of data.by_activity_month ?? []) {
    counts[row.activity] = (counts[row.activity] ?? 0) + row.count
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const labels = entries.map(([k]) => SHORT_LABELS[k] ?? k)
  const values = entries.map(([, v]) => v)

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS,
      borderWidth: 1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Activity Breakdown' },
      legend: { position: 'right' },
    },
  }

  return (
    <div style={styles.wrap}>
      <Doughnut data={chartData} options={options} />
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
