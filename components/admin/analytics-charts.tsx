import Link from "next/link";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/cn";
import { bnCount, bnNumber } from "@/lib/bn-number";
import type { BreakdownRow, DayPoint } from "@/lib/analytics-report";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics-report";

/* ---------------------------------------------------------------------------
 * Analytics chart furniture.
 *
 * All of it renders on the server as plain SVG and CSS. A traffic chart is
 * read, not interacted with, so shipping a charting library to the browser
 * would buy tooltips and cost the console its whole JavaScript budget —
 * `<title>` gives the hover readout for free.
 * ------------------------------------------------------------------------- */

/* ── Range selector ──────────────────────────────────────────────────────── */

export function RangeTabs({ current }: { current: AnalyticsRange }) {
  return (
    <div
      role="group"
      aria-label="সময়সীমা"
      className="flex items-center gap-0.5 rounded-[var(--ad-radius-sm)] border border-[var(--ad-border)] bg-[var(--ad-card)] p-0.5"
    >
      {ANALYTICS_RANGES.map((days) => {
        const active = days === current;
        return (
          <Link
            key={days}
            href={`/admin/analytics?range=${days}`}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={cn(
              "adm-mono rounded-[calc(var(--ad-radius-sm)-2px)] px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
              active
                ? "bg-[var(--ad-text-primary)] text-[var(--ad-card)]"
                : "text-[var(--ad-text-muted)] hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]",
            )}
          >
            {bnNumber(days)} দিন
          </Link>
        );
      })}
    </div>
  );
}

/* ── Traffic chart ───────────────────────────────────────────────────────── */

/** Drawing space. The SVG scales to its container; these are ratios, not pixels. */
const CHART = { width: 760, height: 210, top: 12, bottom: 24 } as const;
const PLOT_HEIGHT = CHART.height - CHART.top - CHART.bottom;

/** At most this many dated labels under the axis, so 90 days stays legible. */
const MAX_AXIS_LABELS = 6;

function pointsFor(values: number[], max: number): { x: number; y: number }[] {
  const step = values.length > 1 ? CHART.width / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: values.length > 1 ? index * step : CHART.width / 2,
    y: CHART.top + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT,
  }));
}

function linePath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function areaPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const baseline = CHART.top + PLOT_HEIGHT;
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`;
}

interface TrafficChartProps {
  series: DayPoint[];
}

/**
 * Page views as a filled area, visitors as a line over it.
 *
 * Two series on one grid rather than two charts, because the gap between them
 * *is* the story — views far above visitors means readers going deeper than
 * one article, and that comparison disappears the moment they are separated.
 */
export function TrafficChart({ series }: TrafficChartProps) {
  const max = Math.max(...series.map((point) => point.pageViews), ...series.map((p) => p.visitors), 1);
  const viewPoints = pointsFor(series.map((p) => p.pageViews), max);
  const visitorPoints = pointsFor(series.map((p) => p.visitors), max);
  const columnWidth = CHART.width / Math.max(series.length, 1);
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_AXIS_LABELS));

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`দৈনিক পাঠ ও পাঠকের রেখাচিত্র, ${bnNumber(series.length)} দিন`}
      >
        <defs>
          <linearGradient id="mk-views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ad-info)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="var(--ad-info)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid — quarter lines, quiet enough to read past. */}
        {[0, 0.5, 1].map((fraction) => {
          const y = CHART.top + PLOT_HEIGHT * fraction;
          return (
            <line
              key={fraction}
              x1={0}
              x2={CHART.width}
              y1={y}
              y2={y}
              stroke="var(--ad-border)"
              strokeWidth={1}
              strokeDasharray={fraction === 1 ? undefined : "3 5"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <path d={areaPath(viewPoints)} fill="url(#mk-views-fill)" />
        <path
          d={linePath(viewPoints)}
          fill="none"
          stroke="var(--ad-info)"
          strokeWidth={1.75}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={linePath(visitorPoints)}
          fill="none"
          stroke="var(--ad-accent)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Today gets a dot on both series — the figure an editor came to read. */}
        {viewPoints.length > 0 && (
          <>
            <circle
              cx={viewPoints[viewPoints.length - 1].x}
              cy={viewPoints[viewPoints.length - 1].y}
              r={3.5}
              fill="var(--ad-info)"
            />
            <circle
              cx={visitorPoints[visitorPoints.length - 1].x}
              cy={visitorPoints[visitorPoints.length - 1].y}
              r={3}
              fill="var(--ad-accent)"
            />
          </>
        )}

        {/* Invisible hit columns carrying the day's readout. */}
        {series.map((point, index) => (
          <rect
            key={point.date.toISOString()}
            x={index * columnWidth}
            y={0}
            width={columnWidth}
            height={CHART.height - CHART.bottom}
            fill="transparent"
            className="hover:fill-[var(--ad-inset)]"
            style={{ fillOpacity: 0.55 }}
          >
            <title>
              {`${point.label} — ${bnCount(point.pageViews)} ভিউ, ${bnCount(point.visitors)} পাঠক, ${bnCount(point.postReads)} সংবাদ পাঠ`}
            </title>
          </rect>
        ))}

        {series.map((point, index) =>
          index % labelEvery === 0 || index === series.length - 1 ? (
            <text
              key={`label-${point.date.toISOString()}`}
              x={Math.min(CHART.width - 18, index * columnWidth + columnWidth / 2)}
              y={CHART.height - 6}
              textAnchor="middle"
              className="adm-mono"
              fontSize={10}
              fill="var(--ad-text-muted)"
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>

      <figcaption className="mt-3 flex flex-wrap items-center gap-4 border-t border-[var(--ad-border)] pt-2.5">
        <LegendKey color="var(--ad-info)" label="পেজ ভিউ" />
        <LegendKey color="var(--ad-accent)" label="পাঠক" dashed />
        <span className="adm-mono ml-auto text-[10.5px] text-[var(--ad-text-muted)]">
          সর্বোচ্চ {bnCount(max)}/দিন
        </span>
      </figcaption>
    </figure>
  );
}

function LegendKey({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("h-0 w-5 border-t-2", dashed && "border-dashed")}
        style={{ borderColor: color }}
      />
      <span className="adm-label">{label}</span>
    </span>
  );
}

/* ── Publishing cadence ──────────────────────────────────────────────────── */

/** Editorial output per day. Bars, because publishing is countable events. */
export function PublishingBars({ series }: { series: DayPoint[] }) {
  const max = Math.max(...series.map((point) => point.posts), 1);

  return (
    <div>
      <div className="flex h-32 items-end gap-1">
        {series.map((point) => (
          <div key={point.date.toISOString()} className="group flex h-full flex-1 flex-col justify-end">
            <div
              title={`${point.label} — ${bnNumber(point.posts)}টি পোস্ট`}
              style={{ height: `${Math.max(3, (point.posts / max) * 100)}%` }}
              className={cn(
                "w-full rounded-t-[3px] transition-colors",
                point.posts > 0
                  ? "bg-[var(--ad-primary-tint-strong)] group-hover:bg-[var(--ad-primary)]"
                  : "bg-[var(--ad-inset)]",
              )}
            />
          </div>
        ))}
      </div>
      <div className="adm-label mt-3 flex justify-between border-t border-[var(--ad-border)] pt-2.5">
        <span>{series[0]?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/* ── Ranked breakdown ────────────────────────────────────────────────────── */

interface BarListProps {
  rows: BreakdownRow[];
  /** Suffix after the figure — "পাঠ", "ভিউ". */
  unit?: string;
  emptyLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Render the share of the total alongside the figure. */
  showShare?: boolean;
  barClassName?: string;
}

/**
 * A ranked list where the bar is the row's background rather than a separate
 * track. It keeps the label readable at any length and stops the panel turning
 * into two columns of unrelated widths.
 */
export function BarList({
  rows,
  unit,
  emptyLabel = "এখনো কোনো তথ্য নেই",
  icon: Icon,
  showShare = false,
  barClassName = "bg-[var(--ad-info-tint)]",
}: BarListProps) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-[var(--ad-text-muted)]">{emptyLabel}</p>
    );
  }

  const max = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <ul className="space-y-1">
      {rows.map((row) => {
        const width = Math.max(2, Math.round((row.value / max) * 100));
        const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
        const label = (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-[12.5px] font-medium text-[var(--ad-text-primary)]">
            {Icon && <Icon className="h-3 w-3 shrink-0 text-[var(--ad-text-muted)]" />}
            {row.label}
          </span>
        );

        return (
          <li
            key={row.key}
            className="relative flex items-center justify-between gap-3 overflow-hidden rounded-[var(--ad-radius-sm)] px-2.5 py-2"
          >
            <span
              aria-hidden
              className={cn("absolute inset-y-0 left-0 rounded-[var(--ad-radius-sm)]", barClassName)}
              style={{ width: `${width}%` }}
            />
            <span className="relative min-w-0 flex-1">
              {row.href ? (
                <Link
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors hover:text-[var(--ad-accent)]"
                >
                  {label}
                </Link>
              ) : (
                label
              )}
            </span>
            <span className="adm-mono relative shrink-0 text-[11.5px] font-semibold text-[var(--ad-text-secondary)]">
              {bnCount(row.value)}
              {unit ? ` ${unit}` : ""}
              {showShare && (
                <span className="ml-2 font-normal text-[var(--ad-text-muted)]">
                  {bnNumber(share)}%
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Device split ────────────────────────────────────────────────────────── */

const DEVICE_META = [
  { key: "mobile", label: "মোবাইল", icon: Smartphone, color: "var(--ad-accent)" },
  { key: "desktop", label: "ডেস্কটপ", icon: Monitor, color: "var(--ad-info)" },
  { key: "tablet", label: "ট্যাবলেট", icon: Tablet, color: "var(--ad-success)" },
] as const;

export function DeviceSplit({
  devices,
}: {
  devices: { mobile: number; tablet: number; desktop: number };
}) {
  const total = devices.mobile + devices.tablet + devices.desktop;

  if (total === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-[var(--ad-text-muted)]">
        এখনো কোনো ডিভাইস তথ্য নেই
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--ad-inset)]">
        {DEVICE_META.map(({ key, color, label }) => {
          const value = devices[key];
          if (value === 0) return null;
          return (
            <span
              key={key}
              title={`${label}: ${bnCount(value)}`}
              style={{ width: `${(value / total) * 100}%`, backgroundColor: color }}
            />
          );
        })}
      </div>
      <ul className="mt-4 space-y-2.5">
        {DEVICE_META.map(({ key, label, icon: Icon, color }) => {
          const value = devices[key];
          return (
            <li key={key} className="flex items-center gap-2.5">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
              <span className="flex-1 text-[12.5px] font-medium text-[var(--ad-text-primary)]">
                {label}
              </span>
              <span className="adm-mono text-[11.5px] text-[var(--ad-text-secondary)]">
                {bnCount(value)}
              </span>
              <span className="adm-mono w-10 text-right text-[11.5px] text-[var(--ad-text-muted)]">
                {bnNumber(Math.round((value / total) * 100))}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
