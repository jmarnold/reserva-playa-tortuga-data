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
  'Verde/Green': '#e9c46a',
  'Carey/Hawksbill': '#f4a261',
}

// Inline plugin: draw value label at the right end of each horizontal bar
const valueLabelPlugin = {
  id: 'clutchValueLabel',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart
    const meta = chart.getDatasetMeta(0)
    ctx.save()
    ctx.fillStyle = '#444'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    meta.data.forEach((bar, i) => {
      const value = data.datasets[0].data[i]
      if (value != null) {
        ctx.fillText(`${value} eggs / clutch`, bar.x + 6, bar.y)
      }
    })
    ctx.restore()
  },
}

export function ClutchSizeBySpecies({ src }) {
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = (data.by_species ?? []).filter(
    r => r.species !== 'Unknown' && r.avg_eggs_per_clutch != null
  )
  if (!rows.length) return null

  // Sort ascending so largest bar is on top
  const sorted = [...rows].sort((a, b) => a.avg_eggs_per_clutch - b.avg_eggs_per_clutch)

  const labels = sorted.map(r => r.species)
  const values = sorted.map(r => Math.round(r.avg_eggs_per_clutch))
  const colors = sorted.map(r => SPECIES_COLORS[r.species] ?? '#adb5bd')

  const chartData = {
    labels,
    datasets: [{
      label: 'Avg eggs per clutch',
      data: values,
      backgroundColor: colors,
      borderRadius: 4,
      barThickness: 32,
    }],
  }

  const maxVal = Math.max(...values)

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: ['Average Clutch Size by Species', 'Eggs laid per successful nest'],
        font: [{ size: 14, weight: 'bold' }, { size: 11 }],
        color: ['#264653', '#888'],
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.x} eggs / clutch`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        // Leave room for the value labels
        suggestedMax: maxVal + 35,
        grid: { display: true },
        title: { display: true, text: 'Average eggs per clutch' },
      },
      y: { grid: { display: false } },
    },
    layout: { padding: { right: 100 } },
  }

  return (
    <div style={styles.wrap}>
      <Bar data={chartData} options={options} plugins={[valueLabelPlugin]} />
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px', maxWidth: '520px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
