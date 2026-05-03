"use client";

import { useEffect, useState } from "react";

// ─── User-growth bar chart ───────────────────────────────────────────────────

interface GrowthDay {
  label: string; // e.g. "Mon"
  count: number;
}

export function UserGrowthChart({ data }: { data: GrowthDay[] }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimated(true)); }, []);

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-36 w-full pt-2">
      {data.map((day) => {
        const pct = (day.count / max) * 100;
        return (
          <div
            key={day.label}
            className="relative group flex-1 flex flex-col items-center gap-1.5 min-w-0"
          >
            {/* Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {day.count}
            </div>

            {/* Bar track */}
            <div className="relative w-full flex-1 flex items-end rounded-t-md overflow-hidden bg-primary/8">
              <div
                className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-all duration-700 ease-out"
                style={{
                  height: animated ? `${Math.max(pct, day.count > 0 ? 4 : 0)}%` : "0%",
                }}
              />
            </div>

            {/* Label */}
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Horizontal progress bar ─────────────────────────────────────────────────

interface BarRow {
  label: string;
  count: number;
  color?: string; // tailwind bg class
}

export function HorizontalBarList({
  data,
  total,
}: {
  data: BarRow[];
  total: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimated(true)); }, []);

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const pct = total > 0 ? (row.count / total) * 100 : 0;
        return (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold truncate max-w-[70%]">{row.label}</span>
              <span className="text-xs font-black text-muted-foreground tabular-nums">
                {row.count}
                <span className="text-muted-foreground/40 font-medium ml-1">
                  ({pct.toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${row.color ?? "bg-primary/70"}`}
                style={{ width: animated ? `${pct}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
