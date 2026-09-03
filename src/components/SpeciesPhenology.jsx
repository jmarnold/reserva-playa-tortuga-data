import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useSeasonData } from '../useSeasonData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend)

const SPECIES_ORDER = ['Lora /Olive ridley', 'Verde/Green', 'Carey/Hawksbill']
const SPECIES_COLORS = {
  'Lora /Olive ridley': '#2a9d8f',
  'Verde/Green': '#e9c46a',
  'Carey/Hawksbill': '#f4a261',
}

// Custom plugin: shade Aug–Oct months as peak nesting season
const peakBandPlugin = {
  id: 'peakBand',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea || !scales.x) return
    const labels = chart.data.labels ?? []
    ctx.save()
    ctx.fillStyle = 'rgba(233, 196, 106, 0.12)'
    labels.forEach((label, i) => {
      const mo = parseInt(label.split('-')[1], 10)
      if (mo >= 8 && mo <= 10) {
        const x0 = scales.x.getPixelForValue(i - 0.5)
        const x1 = scales.x.getPixelForValue(i + 0.5)
        ctx.fillRect(x0, chartArea.top, x1 - x0, chartArea.bottom - chartArea.top)
      }
    })
    ctx.restore()
  },
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea || !scales.x) return
    const labels = chart.data.labels ?? []
    // Find the first aug-oct band to label it
    let bandStart = null
    let bandEnd = null
    labels.forEach((label, i) => {
      const mo = parseInt(label.split('-')[1], 10)
      if (mo >= 8 && mo <= 10) {
        if (bandStart === null) bandStart = i
        bandEnd = i
      } else if (bandStart !== null && bandEnd !== null && mo > 10) {
        // Only label the first complete band
        if (bandEnd - bandStart >= 1) {
          const x0 = scales.x.getPixelForValue(bandStart - 0.5)
          const x1 = scales.x.getPixelForValue(bandEnd + 0.5)
          ctx.save()
          ctx.fillStyle = 'rgba(180, 130, 30, 0.7)'
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText('Peak nesting season', (x0 + x1) / 2, chartArea.top + 4)
          ctx.restore()
        }
        bandStart = null
        bandEnd = null
      }
    })
  },
}

export function SpeciesPhenology({ src }) {
  const { data, error } = useSeasonData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.by_species_month ?? []
  const allMonths = (data.by_month ?? []).map(r => r.month)
  if (!allMonths.length) return null

  const datasets = SPECIES_ORDER.map((sp, idx) => {
    const color = SPECIES_COLORS[sp]
    return {
      label: sp,
      data: allMonths.map(mo => {
        const match = rows.find(r => r.month === mo && r.species === sp)
        return match ? match.nests : 0
      }),
      borderColor: color,
      backgroundColor: color + '55',
      fill: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 5,
      order: SPECIES_ORDER.length - idx, // Olive Ridley drawn on top of stack
    }
  })

  const chartData = { labels: allMonths, datasets }

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: 'Nesting Phenology by Species (monthly)' },
      legend: { position: 'top' },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 18 },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: 'Nests' },
      },
    },
  }

  return (
    <div style={styles.wrap}>
      <Line data={chartData} options={options} plugins={[peakBandPlugin]} />
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
}
