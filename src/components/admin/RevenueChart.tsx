"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice, type Locale } from "@/lib/i18n";

/** Single-series bar chart of revenue per day, with a hover/focus tooltip and a table view. */
export function RevenueChart({
  data,
  locale,
  title,
  tableLabel,
  dateLabel,
}: {
  data: { day: string; value: number }[];
  locale: Locale;
  title: string;
  tableLabel: string;
  dateLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  // Draw at the real on-screen width so axis text stays readable on phones.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 200;
  const pad = { top: 12, bottom: 22, left: 44, right: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step;
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const slot = plotW / data.length;
  const barW = Math.max(2, Math.min(28, slot - 2)); // 2px gap between bars
  const y = (v: number) => pad.top + plotH - (v / top) * plotH;
  const short = (day: string) => `${day.slice(8)}/${day.slice(5, 7)}`;
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(plotW / 48)));
  const compact = new Intl.NumberFormat("fr-DZ", { notation: "compact", maximumFractionDigits: 1 });

  return (
    <figure className="admin-chart">
      <figcaption>{title}</figcaption>
      <div className="admin-chart__plot" dir="ltr" ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} onMouseLeave={() => setHover(null)}>
          {[0, 1, 2, 3].map((i) => {
            const v = (top / 3) * i;
            return (
              <g key={i}>
                <line x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} className="admin-chart__grid" />
                <text x={pad.left - 6} y={y(v) + 4} textAnchor="end" className="admin-chart__axis">
                  {compact.format(v)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const x = pad.left + i * slot + (slot - barW) / 2;
            const h = Math.max(0, y(0) - y(d.value));
            const r = Math.min(4, barW / 2, h);
            return (
              <g key={d.day}>
                {h > 0 && (
                  <path
                    d={`M${x},${y(0)} v${-(h - r)} q0,${-r} ${r},${-r} h${barW - 2 * r} q${r},0 ${r},${r} v${h - r} z`}
                    className={`admin-chart__bar${hover === i ? " is-hover" : ""}`}
                  />
                )}
                {i % labelEvery === 0 && (
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="admin-chart__axis">
                    {short(d.day)}
                  </text>
                )}
                {/* Hit target wider and taller than the bar. */}
                <rect
                  x={pad.left + i * slot}
                  y={pad.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="admin-chart__tip"
            style={{ left: `${((pad.left + (hover + 0.5) * slot) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}
          >
            <span>{data[hover].day}</span>
            <strong>{formatPrice(data[hover].value, locale)}</strong>
          </div>
        )}
      </div>
      <details className="admin-chart__table">
        <summary>{tableLabel}</summary>
        <table>
          <thead>
            <tr>
              <th>{dateLabel}</th>
              <th>{title}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day}>
                <td dir="ltr">{d.day}</td>
                <td>{formatPrice(d.value, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}
