const counters = new Map<string, number>();
const samples = new Map<string, number[]>();

export function incrementMetric(name: string, labels: Record<string, string> = {}): void {
  const key = `${name}:${JSON.stringify(Object.entries(labels).sort())}`;
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

export function observeMetric(name: string, value: number, labels: Record<string, string> = {}): void {
  const key = `${name}:${JSON.stringify(Object.entries(labels).sort())}`;
  const values = samples.get(key) ?? [];
  values.push(value);
  if (values.length > 2_048) values.shift();
  samples.set(key, values);
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

export function snapshotMetrics(): Record<string, unknown> {
  return {
    counters: Object.fromEntries(counters),
    distributions: Object.fromEntries([...samples.entries()].map(([key, values]) => [key, {
      count: values.length, p50: percentile(values, 0.50), p95: percentile(values, 0.95),
      p99: percentile(values, 0.99), max: values.length ? Math.max(...values) : 0,
    }])),
  };
}
