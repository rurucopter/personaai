import type { DayPoint } from "@/lib/admin/analytics";

export function BarChart({
  data,
  formatValue,
  color = "var(--brand)",
}: {
  data: DayPoint[];
  formatValue?: (value: number) => string;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const format = formatValue ?? ((v: number) => String(v));
  const step = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-32 items-end gap-1">
        {data.map((point, i) => (
          <div
            key={i}
            className="group relative flex-1 rounded-sm transition-opacity hover:opacity-80"
            style={{
              height: `${Math.max(2, (point.value / max) * 100)}%`,
              backgroundColor: color,
              opacity: point.value === 0 ? 0.15 : 1,
            }}
          >
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background group-hover:block">
              {point.label} — {format(point.value)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 text-xs text-muted-foreground">
        {data.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            {i % step === 0 ? point.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
