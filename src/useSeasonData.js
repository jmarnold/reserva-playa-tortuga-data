import { useMemo } from 'react'
import { useData } from './useData'
import { filterToSeasons } from './seasonFilter'

export function useSeasonData(src) {
  const { data, error } = useData(src)
  const filtered = useMemo(() => filterToSeasons(data), [data])
  return { data: filtered, error }
}
