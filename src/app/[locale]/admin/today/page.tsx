"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { useRows } from "@/components/admin/useRows";
import { categories } from "@/data/menu";
import { isoDay } from "@/lib/admin/dates";
import type { DailyCount } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

type Counts = Record<string, { produced: number; sold: number; wasted: number }>;

export default function TodayPage() {
  const { store, t, locale } = useAdmin();
  const [day, setDay] = useState(isoDay());
  const { rows: products } = useRows("products");
  const { rows: saved, reload } = useRows("daily_counts", { from: day, to: day });
  const [counts, setCounts] = useState<Counts>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | string>("idle");

  const active = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.active)
        .sort((a, b) => categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category)),
    [products],
  );
  const savedByProduct = useMemo(() => new Map((saved ?? []).map((c) => [c.product_id, c])), [saved]);

  // Load what was already saved for the chosen day into the inputs.
  useEffect(() => {
    const next: Counts = {};
    for (const c of saved ?? []) next[c.product_id] = { produced: c.produced, sold: c.sold, wasted: c.wasted };
    setCounts(next);
    setStatus("idle");
  }, [saved]);

  function set(productId: string, key: "produced" | "sold" | "wasted", value: string) {
    const current = counts[productId] ?? { produced: 0, sold: 0, wasted: 0 };
    setCounts({ ...counts, [productId]: { ...current, [key]: value === "" ? 0 : Number(value) } });
    setStatus("idle");
  }

  async function saveAll() {
    setStatus("saving");
    const rows: Omit<DailyCount, "id">[] = [];
    for (const p of active) {
      const c = counts[p.id];
      const before = savedByProduct.get(p.id);
      if (!c || (!before && !c.produced && !c.sold && !c.wasted)) continue;
      rows.push({
        day,
        product_id: p.id,
        ...c,
        // Keep the price and cost from when the day was first saved.
        unit_price: before?.unit_price ?? p.price,
        unit_cost: before?.unit_cost ?? p.unit_cost,
      });
    }
    try {
      await store.saveDailyCounts(rows);
      await reload();
      setStatus("saved");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  const revenue = active.reduce((sum, p) => sum + (counts[p.id]?.sold ?? 0) * (savedByProduct.get(p.id)?.unit_price ?? p.price), 0);
  const name = (p: (typeof active)[number]) => (locale === "ar" ? p.name_ar : p.name_fr || p.name_ar);

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.today}</h1>
        <input type="date" value={day} max={isoDay()} onChange={(e) => e.target.value && setDay(e.target.value)} dir="ltr" />
      </div>
      <p className="admin-hint">{t.today.hint}</p>

      {!products && <p>{t.common.loading}</p>}
      {products && active.length === 0 && <p className="admin-empty">{t.today.noProducts}</p>}

      <ul className="admin-counts">
        {active.map((p) => {
          const c = counts[p.id] ?? { produced: 0, sold: 0, wasted: 0 };
          const left = c.produced - c.sold - c.wasted;
          const inputs = [
            { key: "produced" as const, label: p.source === "resale" ? t.today.bought : t.today.produced },
            { key: "sold" as const, label: t.today.sold },
            { key: "wasted" as const, label: t.today.wasted },
          ];
          return (
            <li key={p.id} className="admin-card">
              <div className="admin-counts__name">
                <strong>{name(p)}</strong>
                <span className={left < 0 ? "admin-warn" : undefined}>
                  {t.today.left}: {left}
                </span>
              </div>
              <div className="admin-counts__inputs">
                {inputs.map((i) => (
                  <label key={i.key}>
                    {i.label}
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={c[i.key] || ""}
                      placeholder="0"
                      onChange={(e) => set(p.id, i.key, e.target.value)}
                      dir="ltr"
                    />
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {active.length > 0 && (
        <div className="admin-savebar">
          <span>
            {t.today.revenue}: <strong>{formatPrice(revenue, locale)}</strong>
          </span>
          <button className="btn btn--primary" onClick={saveAll} disabled={status === "saving"}>
            {status === "saving" ? t.common.saving : status === "saved" ? `✓ ${t.common.saved}` : t.today.saveAll}
          </button>
          {!["idle", "saving", "saved"].includes(status) && (
            <p className="admin-error" role="alert">
              {t.common.error} {status}
            </p>
          )}
        </div>
      )}
    </>
  );
}
