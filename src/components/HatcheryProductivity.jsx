import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useData } from '../useData'
import { CURRENT_YEAR } from '../seasonFilter'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const BEACHES = [
  { name: 'Tortuga', color: '#1a6b5f' },
  { name: 'Hermosa', color: '#52b788' },
]

// Colour for a point we are telling the reader not to trust. Deliberately
// not one of the beach colours -- it has to read as a warning, not as a
// third beach.
const FLAG_COLOR = '#c1443c'

// The four figures the field team reads off the exhumation sheet. `n` is
// the count that figure was actually averaged over, which is not always
// nests_exhumed: fertility was recorded far more consistently than
// emergence, and `# Nli` was not a column at all before 2019.
const METRICS = [
  {
    key: 'fertility_pct',
    label: 'Fertility',
    nKey: 'fertility_n',
    axis: '% of eggs fertile',
    suffix: '%',
    max: 100,
    flagKey: 'fertility_contradicted',
    cleanKey: 'fertility_pct_consistent',
    // Fertility below 20% in a nest whose shells show most of the
    // clutch hatched. Eggs that hatch were fertile.
    flagWhy: 'stored fertility contradicted by the nests’ own shell counts',
  },
  {
    key: 'emergence_pct',
    label: 'Emergence',
    nKey: 'emergence_n',
    axis: '% of eggs emerged',
    suffix: '%',
    max: 100,
    flagKey: 'emergence_contradicted',
    cleanKey: 'emergence_pct_consistent',
    flagWhy: 'stored emergence contradicted by the nests’ own hatch counts',
  },
  {
    key: 'eggs_per_nest',
    label: 'Eggs per nest',
    nKey: 'nests_exhumed',
    axis: 'Eggs counted at exhumation',
    suffix: '',
  },
  {
    key: 'released_per_nest',
    label: 'Hatchlings released per nest',
    nKey: 'released_n',
    axis: 'Hatchlings released',
    suffix: '',
  },
]

// A season's figure is worth drawing but not worth quoting when the
// column it came from is mostly empty, or when the stored rate
// contradicts the nests' own counts. Both are recording problems, so
// they are marked rather than corrected here.
const THIN = 0.5

// Two ways a season earns a mark, because neither test catches the other's
// cases. Share alone misses Tortuga 2022 fertility, where 26 failing nests
// out of 126 drag the season mean down 17 points. Shift alone misses
// Tortuga 2015, where 22 of 51 fail and excluding them still leaves 13.4%
// -- a mean that barely moves because almost the whole column is wrong.
const FLAG_SHARE = 0.15
const FLAG_SHIFT = 5

function reliability(row, metric) {
  const n = row[metric.nKey]
  if (!n) return 'none'
  const failing = metric.flagKey ? row[metric.flagKey] : 0
  if (failing > 0) {
    const clean = row[metric.cleanKey]
    const shift = clean === null || clean === undefined
      ? 0
      : Math.abs(clean - row[metric.key])
    if (failing / n >= FLAG_SHARE || shift >= FLAG_SHIFT) return 'contradicted'
  }
  if (n / row.nests_exhumed < THIN) return 'thin'
  return 'ok'
}

// "Tortuga 2009, 2010, ... 2018" is ten items the reader has to reassemble
// into one fact. Consecutive seasons collapse to a range instead.
function asRanges(labels) {
  const byBeach = new Map()
  labels.forEach(({ beach, season }) => {
    if (!byBeach.has(beach)) byBeach.set(beach, [])
    byBeach.get(beach).push(Number(season))
  })
  return [...byBeach.entries()].map(([beach, years]) => {
    years.sort((a, b) => a - b)
    const runs = []
    years.forEach(y => {
      const last = runs[runs.length - 1]
      if (last && y === last[1] + 1) last[1] = y
      else runs.push([y, y])
    })
    const spans = runs.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`))
    return `${beach} ${spans.join(', ')}`
  })
}

function caveat(row, metric) {
  const state = reliability(row, metric)
  return null
}

export function HatcheryProductivity({ src }) {
  const [metricKey, setMetricKey] = useState(METRICS[0].key)
  const { data, error } = useData(src)

  if (error) return <p style={styles.msg}>Error: {error}</p>
  if (!data) return <p style={styles.msg}>Loading…</p>

  const rows = data.productivity_by_beach_season ?? []
  if (!rows.length) return null

  const metric = METRICS.find(m => m.key === metricKey) ?? METRICS[0]
  const seasons = [...new Set(rows.map(r => r.season))].sort()
  const lastIdx = seasons.length - 1
  const rowFor = (beach, season) => rows.find(r => r.beach === beach && r.season === season)

  const datasets = BEACHES.map(({ name, color }) => {
    const points = seasons.map(s => {
      const row = rowFor(name, s)
      const value = row?.[metric.key]
      return value === null || value === undefined ? null : value
    })
    const states = seasons.map(s => {
      const row = rowFor(name, s)
      return row ? reliability(row, metric) : 'none'
    })

    return {
      label: name,
      data: points,
      borderColor: color,
      backgroundColor: color + '22',
      tension: 0.3,
      borderWidth: 2,
      pointRadius: states.map(st => (st === 'ok' ? 4 : 6)),
      pointHoverRadius: 8,
      // A flagged season is drawn as a hollow ring so it cannot be read
      // off the line as if it were a measurement.
      pointBackgroundColor: states.map(st =>
        st === 'contradicted' ? FLAG_COLOR : st === 'thin' ? '#fff' : color
      ),
      pointBorderColor: states.map(st => (st === 'contradicted' ? FLAG_COLOR : color)),
      pointBorderWidth: states.map(st => (st === 'ok' ? 1 : 2)),
      pointStyle: states.map(st => (st === 'contradicted' ? 'crossRot' : 'circle')),
      // Gaps are real: Tortuga has no released count before 2019. Joining
      // across them would draw a line through seasons that hold no figure.
      spanGaps: false,
      segment: {
        borderDash: ctx => (ctx.p1DataIndex === lastIdx ? [5, 4] : undefined),
      },
    }
  })

  // The same mean with the failing nests dropped. Closer to the truth,
  // still not publishable -- drawn dashed and thin so the distance
  // between the two lines is the visible thing rather than the value.
  if (metric.cleanKey) {
    BEACHES.forEach(({ name, color }) => {
      const anyFlagged = seasons.some(s => {
        const row = rowFor(name, s)
        return row && reliability(row, metric) === 'contradicted'
      })
      if (!anyFlagged) return
      datasets.push({
        label: `${name} — excluding failing nests`,
        data: seasons.map(s => rowFor(name, s)?.[metric.cleanKey] ?? null),
        borderColor: color,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        spanGaps: false,
      })
    })
  }

  const seasonsIn = state =>
    BEACHES.flatMap(({ name }) =>
      seasons
        .map(s => rowFor(name, s))
        .filter(row => row && reliability(row, metric) === state)
        .map(row => ({ beach: row.beach, season: row.season }))
    )

  // Two different faults, and conflating them would tell the field team
  // to go looking for a broken formula in a season whose column was
  // simply never filled in.
  const contradicted = asRanges(seasonsIn('contradicted'))
  const thin = asRanges(seasonsIn('thin'))

  // Seasons that were worked and exhumed but hold no value for this
  // measure at all. The line simply stops, and without saying so the gap
  // reads as a hatchery that released nothing.
  const unrecorded = asRanges(seasonsIn('none'))

  const hasPartial = seasons.includes(CURRENT_YEAR)

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      title: { display: true, text: `Hatchery Productivity by Beach — ${metric.label}` },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          // Chart.js builds a swatch from element 0 of any per-point style
          // array, so a season marked in 2009 would colour the whole series'
          // legend entry as a warning. The swatch identifies the beach; the
          // marks on the line carry the warning.
          generateLabels: chart =>
            chart.data.datasets.map((ds, i) => ({
              text: ds.label,
              strokeStyle: ds.borderColor,
              fillStyle: ds.borderDash ? 'transparent' : ds.borderColor,
              lineWidth: ds.borderDash ? 1.5 : 1,
              lineDash: ds.borderDash,
              pointStyle: 'circle',
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            })),
        },
      },
      tooltip: {
        callbacks: {
          title: ctx => {
            const season = ctx[0].label
            return season === CURRENT_YEAR ? `${season} (season in progress)` : season
          },
          label: ctx => {
            const isClean = ctx.dataset.label.includes('—')
            const row = rowFor(ctx.dataset.label.split(' — ')[0], ctx.label)
            const value = ctx.parsed.y
            if (value === null) return `${ctx.dataset.label}: not recorded`
            // The cleaned mean is over the nests that survived the check,
            // not over the whole column, and quoting the full n beside it
            // would overstate what it rests on.
            const count = !row
              ? null
              : isClean
                ? row[metric.nKey] - row[metric.flagKey]
                : row[metric.nKey]
            const n = count === null ? '' : ` (n=${count})`
            return `${ctx.dataset.label}: ${value}${metric.suffix}${n}`
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Season' } },
      y: {
        beginAtZero: true,
        max: metric.max,
        title: { display: true, text: metric.axis },
      },
    },
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.tabs}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetricKey(m.key)}
            style={m.key === metricKey ? styles.tabOn : styles.tab}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Line data={{ labels: seasons, datasets }} options={options} />

      <p style={styles.note}>
        Averages over exhumed nests. Eggs are counted at exhumation, not
        estimated on the beach.
        {hasPartial && ` Dashed final segment = ${CURRENT_YEAR} (season in progress).`}
      </p>
    </div>
  )
}

const styles = {
  wrap: { fontFamily: 'sans-serif', padding: '8px' },
  msg: { fontFamily: 'sans-serif', color: '#555' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 10px' },
  tab: {
    font: 'inherit',
    fontSize: '0.75rem',
    padding: '4px 10px',
    border: '1px solid #cfdedb',
    borderRadius: '999px',
    background: '#fff',
    color: '#3d6660',
    cursor: 'pointer',
  },
  tabOn: {
    font: 'inherit',
    fontSize: '0.75rem',
    padding: '4px 10px',
    border: '1px solid #1a6b5f',
    borderRadius: '999px',
    background: '#1a6b5f',
    color: '#fff',
    cursor: 'pointer',
  },
  note: { fontSize: '0.75rem', color: '#888', margin: '6px 8px 0' },
  warn: { fontSize: '0.75rem', color: '#a2352e', margin: '6px 8px 0', lineHeight: 1.45 },
}
