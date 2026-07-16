export function formatCompactCount(value: number | null | undefined): string {
  const count = Math.max(0, Math.floor(Number(value) || 0))

  const formatUnit = (divisor: number, suffix: string) => {
    const scaled = count / divisor
    const precision = scaled < 100 ? 10 : 1
    const truncated = Math.floor(scaled * precision) / precision
    return `${truncated.toFixed(precision === 10 ? 1 : 0).replace(/\.0$/, "")}${suffix}`
  }

  if (count >= 1_000_000_000) return formatUnit(1_000_000_000, "B")
  if (count >= 1_000_000) return formatUnit(1_000_000, "M")
  if (count >= 1_000) return formatUnit(1_000, "k")
  return String(count)
}
