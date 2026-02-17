const perfEnabled = process.env.NODE_ENV !== 'production' || process.env.DEBUG_PERF === 'true'

export type RepoMetrics = { queryMs: number; serializationMs: number; totalMs: number; rows: number }

export function logRepoPerf(label: string, metrics: RepoMetrics) {
  if (!perfEnabled) return
  console.debug(
    `[perf][repo:${label}] queryMs=${metrics.queryMs.toFixed(2)}ms serializationMs=${metrics.serializationMs.toFixed(2)}ms totalMs=${metrics.totalMs.toFixed(2)}ms rows=${metrics.rows}`
  )
}
