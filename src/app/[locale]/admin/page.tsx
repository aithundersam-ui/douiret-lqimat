"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useRows } from "@/components/admin/useRows";
import { addDays, daysBetween, isoDay, startOfMonth } from "@/lib/admin/dates";
import { inLanguage, type Product } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

type RangeKey = "today" | "week" | "month";

export default function DashboardPage() {
  const { t, locale } = useAdmin();
  const d = t.dashboard;
  const today = isoDay();
  const [rangeKey, setRangeKey] = useState<RangeKey>("week");
  const from = rangeKey === "today" ? today : rangeKey === "week" ? addDays(today, -6) : startOfMonth(today);
  // The chart always shows at least the last 7 days.
  const chartFrom = from < addDays(today, -6) ? from : addDays(today, -6);

  const { rows: products } = useRows("products");
  const { rows: counts, error } = useRows("daily_counts", { from: chartFrom, to: today });
  const { rows: expenses } = useRows("expenses", { from, to: today });
  const { rows: orders } = useRows("orders", { from: today, to: addDays(today, 7) });
  const { rows: purchases } = useRows("purchases");

  const stats = useMemo(() => {
    if (!products || !counts || !expenses) return null;
    const byId = new Map<string, Product>(products.map((p) => [p.id, p]));
    const inRange = counts.filter((c) => c.day >= from);

    let revenue = 0, cogs = 0, wasteCost = 0, produced = 0, wasted = 0;
    const perProduct = new Map<string, { revenue: number; sold: number; wasteCost: number; wasted: number }>();
    const bySource = { made: { sales: 0, profit: 0 }, resale: { sales: 0, profit: 0 } };

    for (const c of inRange) {
      const rev = c.sold * c.unit_price;
      const cost = c.sold * c.unit_cost;
      const loss = c.wasted * c.unit_cost;
      revenue += rev;
      cogs += cost;
      wasteCost += loss;
      const source = byId.get(c.product_id)?.source ?? "made";
      if (source === "made") {
        produced += c.produced;
        wasted += c.wasted;
      }
      bySource[source].sales += rev;
      bySource[source].profit += rev - cost - loss;
      const p = perProduct.get(c.product_id) ?? { revenue: 0, sold: 0, wasteCost: 0, wasted: 0 };
      p.revenue += rev;
      p.sold += c.sold;
      p.wasteCost += loss;
      p.wasted += c.wasted;
      perProduct.set(c.product_id, p);
    }

    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const name = (id: string) => {
      const p = byId.get(id);
      return p ? inLanguage(locale, p.name_en, p.name_ar, p.name_fr) : "?";
    };
    const ranked = [...perProduct.entries()].map(([id, v]) => ({ name: name(id), ...v }));

    const daily = new Map<string, number>();
    for (const c of counts) daily.set(c.day, (daily.get(c.day) ?? 0) + c.sold * c.unit_price);

    return {
      revenue,
      cogs,
      wasteCost,
      expenseTotal,
      net: revenue - cogs - wasteCost - expenseTotal,
      wastePct: produced ? (wasted / produced) * 100 : 0,
      bySource,
      top: ranked.filter((r) => r.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      worst: ranked.filter((r) => r.wasteCost > 0).sort((a, b) => b.wasteCost - a.wasteCost).slice(0, 5),
      chart: daysBetween(chartFrom, today).map((day) => ({ day, value: daily.get(day) ?? 0 })),
    };
  }, [products, counts, expenses, from, chartFrom, today, locale]);

  const upcoming = (orders ?? [])
    .filter((o) => o.status !== "delivered" && o.status !== "cancelled")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const depositsDue = upcoming.reduce((s, o) => s + Math.max(0, o.total - o.deposit), 0);

  const owed = new Map<string, number>();
  for (const p of purchases ?? []) {
    const due = p.total - p.paid;
    if (due > 0) owed.set(p.supplier || "—", (owed.get(p.supplier || "—") ?? 0) + due);
  }
  const owedList = [...owed.entries()].sort((a, b) => b[1] - a[1]);
  const owedTotal = owedList.reduce((s, [, v]) => s + v, 0);

  const money = (v: number) => formatPrice(Math.round(v), locale);

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.dashboard}</h1>
        <div className="admin-segment" role="tablist">
          {(["today", "week", "month"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={rangeKey === k} onClick={() => setRangeKey(k)}>
              {d.ranges[k]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {t.common.error} {error}
        </p>
      )}
      {!stats && !error && <p>{t.common.loading}</p>}

      {stats && (
        <>
          <div className="admin-tiles">
            <Tile label={d.revenue} value={money(stats.revenue)} />
            <Tile label={d.netProfit} value={money(stats.net)} tone={stats.net < 0 ? "bad" : "good"} note={d.profitNote} />
            <Tile label={d.costOfGoods} value={money(stats.cogs)} />
            <Tile label={d.wasteCost} value={money(stats.wasteCost)} />
            <Tile label={d.expenses} value={money(stats.expenseTotal)} />
            <Tile
              label={d.wastePct}
              value={`${stats.wastePct.toFixed(1)}%`}
              tone={stats.wastePct > 10 ? "bad" : "good"}
              note={d.wasteTarget}
            />
          </div>

          {stats.revenue === 0 && <p className="admin-empty">{d.noData}</p>}

          <RevenueChart data={stats.chart} locale={locale} title={d.dailyRevenue} tableLabel={d.showTable} dateLabel={t.common.date} />

          <div className="admin-grid">
            <section className="admin-card">
              <h2>{d.madeVsResale}</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th />
                    <th>{d.sales}</th>
                    <th>{d.profit}</th>
                  </tr>
                </thead>
                <tbody>
                  {(["made", "resale"] as const).map((s) => (
                    <tr key={s}>
                      <th>{t.products.sources[s]}</th>
                      <td>{money(stats.bySource[s].sales)}</td>
                      <td>{money(stats.bySource[s].profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <RankList title={d.topProducts} rows={stats.top.map((r) => [r.name, money(r.revenue)])} empty={d.noData} />
            <RankList title={d.mostWaste} rows={stats.worst.map((r) => [r.name, money(r.wasteCost)])} empty={d.noData} />

            <section className="admin-card">
              <h2>{d.upcomingOrders}</h2>
              {upcoming.length === 0 ? (
                <p className="admin-empty">{d.noOrders}</p>
              ) : (
                <>
                  <ul className="admin-rank">
                    {upcoming.map((o) => (
                      <li key={o.id}>
                        <span>
                          <bdi dir="ltr">{o.due_date.slice(5)}</bdi> · <bdi>{o.customer}</bdi> · {t.orders.statuses[o.status]}
                        </span>
                        <strong>{money(o.total)}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="admin-total">
                    {d.depositsDue}: <strong>{money(depositsDue)}</strong>
                  </p>
                </>
              )}
            </section>

            <section className="admin-card">
              <h2>{d.owedSuppliers}</h2>
              {owedList.length === 0 ? (
                <p className="admin-empty">{d.noDebts}</p>
              ) : (
                <>
                  <ul className="admin-rank">
                    {owedList.map(([supplier, v]) => (
                      <li key={supplier}>
                        <bdi>{supplier}</bdi>
                        <strong>{money(v)}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="admin-total">
                    <strong>{money(owedTotal)}</strong>
                  </p>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}

function Tile({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "good" | "bad" }) {
  return (
    <div className="admin-tile">
      <span className="admin-tile__label">{label}</span>
      <strong className="admin-tile__value">
        {tone && (
          <span className={`admin-tile__dot admin-tile__dot--${tone}`} aria-hidden>
            {tone === "good" ? "✓" : "!"}
          </span>
        )}
        {value}
      </strong>
      {note && <span className="admin-tile__note">{note}</span>}
    </div>
  );
}

function RankList({ title, rows, empty }: { title: string; rows: [string, string][]; empty: string }) {
  return (
    <section className="admin-card">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="admin-empty">{empty}</p>
      ) : (
        <ol className="admin-rank">
          {rows.map(([name, value]) => (
            <li key={name}>
              <span>{name}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
