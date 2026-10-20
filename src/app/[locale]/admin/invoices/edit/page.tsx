"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { addDays, isoDay } from "@/lib/admin/dates";
import { invoiceTotals, nextNumber, unitText, withBusinessDefaults } from "@/lib/admin/invoices";
import type { NewRow } from "@/lib/admin/store";
import { paymentMethods, type Invoice, type InvoiceKind, type Order, type Product } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

type Draft = NewRow<"invoices">;

export default function EditInvoicePage() {
  return (
    <Suspense>
      <EditInvoice />
    </Suspense>
  );
}

/** Product name as written on invoices: French first, like the shop's template. */
const invoiceName = (p: Product) => p.name_fr || p.name_en || p.name_ar;

function EditInvoice() {
  const { store, t, locale } = useAdmin();
  const v = t.invoices;
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const from = params.get("from");
  const kindParam: InvoiceKind = params.get("kind") === "proforma" ? "proforma" : "invoice";

  const [draft, setDraft] = useState<Draft | null>(null);
  const [all, setAll] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([store.list("invoices"), store.list("products"), store.list("orders"), store.getBusiness()])
      .then(([invoices, products, orders, saved]) => {
        setAll(invoices);
        setProducts(products.filter((p) => p.active));
        setOrders(orders.filter((o) => o.status !== "cancelled").sort((a, b) => b.due_date.localeCompare(a.due_date)));
        const business = withBusinessDefaults(saved);
        const today = isoDay();
        const existing = invoices.find((i) => i.id === id);
        const source = invoices.find((i) => i.id === from);
        if (existing) {
          const { id: _id, ...rest } = existing;
          setDraft(rest);
        } else if (source) {
          // Turning a proforma into an invoice: same customer and lines, new number and date.
          const { id: _id, ...rest } = source;
          setDraft({ ...rest, kind: "invoice", number: nextNumber("invoice", invoices, business, today), issue_date: today, due_date: today });
        } else if (id) {
          setStatus(v.notFound);
        } else {
          setDraft({
            kind: kindParam,
            number: nextNumber(kindParam, invoices, business, today),
            issue_date: today,
            due_date: kindParam === "proforma" ? addDays(today, 15) : today,
            customer_name: "",
            customer_address: "",
            customer_phone: "",
            customer_tax_id: "",
            payment_method: "cash",
            lines: [{ description: "", unit: "", qty: 1, unit_price: 0 }],
            discount: 0,
            vat_rate: business.vatRate,
            stamp_duty: 0,
            notes: "",
            order_id: null,
          });
        }
      })
      .catch((err) => setStatus((err as Error).message));
  }, [store, id, from, kindParam, v.notFound]);

  if (!draft) {
    return status ? (
      <p className="admin-error" role="alert">
        {status}
      </p>
    ) : (
      <p>{t.common.loading}</p>
    );
  }

  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const setLine = (i: number, patch: Partial<Draft["lines"][number]>) =>
    set({ lines: draft.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const totals = invoiceTotals(draft);
  const base = `/${locale}/admin/invoices`;

  function fillFromOrder(orderId: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    set({
      order_id: order.id,
      customer_name: order.customer,
      customer_phone: order.phone,
      lines: [{ description: order.items, unit: "", qty: 1, unit_price: order.total }],
    });
  }

  function pickProduct(i: number, name: string) {
    const product = products.find((p) => invoiceName(p) === name);
    setLine(i, product ? { description: name, unit: unitText[product.unit], unit_price: product.price } : { description: name });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const lines = draft!.lines.filter((l) => l.description.trim());
    if (!lines.length) return setStatus(v.noLines);
    if (all.some((i) => i.number === draft!.number && i.id !== id)) return setStatus(`${v.number}: ${draft!.number} ✕`);
    setStatus("saving");
    try {
      const row = { ...draft!, lines };
      let savedId = id;
      if (id) await store.update("invoices", id, row);
      else {
        await store.insert("invoices", row);
        savedId = (await store.list("invoices")).find((i) => i.number === row.number)?.id ?? null;
      }
      router.push(savedId ? `${base}/view/?id=${savedId}` : `${base}/`);
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  return (
    <form onSubmit={save} className="admin-invoice-form">
      <div className="admin-head">
        <h1>
          {draft.kind === "invoice" ? v.invoice : v.proforma} · <bdi dir="ltr">{draft.number}</bdi>
        </h1>
        <Link className="btn btn--ghost" href={`${base}/`}>
          {v.back}
        </Link>
      </div>

      <section className="admin-card admin-section">
        <h2>{v.customer}</h2>
        {!id && orders.length > 0 && (
          <label className="admin-field">
            {v.fromOrder}
            <select value={draft.order_id ?? ""} onChange={(e) => fillFromOrder(e.target.value)}>
              <option value="">{v.chooseOrder}</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.customer} · {o.due_date} · {formatPrice(o.total, locale)}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="admin-pair">
          <label>
            {v.customerName}
            <input required value={draft.customer_name} onChange={(e) => set({ customer_name: e.target.value })} />
          </label>
          <label>
            {v.customerPhone}
            <input type="tel" dir="ltr" value={draft.customer_phone} onChange={(e) => set({ customer_phone: e.target.value })} />
          </label>
          <label>
            {v.customerAddress}
            <input value={draft.customer_address} onChange={(e) => set({ customer_address: e.target.value })} />
          </label>
          <label>
            {v.customerTaxId}
            <input dir="ltr" value={draft.customer_tax_id} onChange={(e) => set({ customer_tax_id: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="admin-card admin-section">
        <div className="admin-pair">
          <label>
            {v.number}
            <input required dir="ltr" value={draft.number} onChange={(e) => set({ number: e.target.value })} />
          </label>
          <label>
            {v.payment}
            <select value={draft.payment_method} onChange={(e) => set({ payment_method: e.target.value as Draft["payment_method"] })}>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {v.payments[m]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {v.issueDate}
            <input required type="date" value={draft.issue_date} onChange={(e) => set({ issue_date: e.target.value })} />
          </label>
          <label>
            {draft.kind === "invoice" ? v.dueDate : v.validUntil}
            <input required type="date" value={draft.due_date} onChange={(e) => set({ due_date: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="admin-card admin-section">
        <h2>{v.lines}</h2>
        <datalist id="invoice-products">
          {products.map((p) => (
            <option key={p.id} value={invoiceName(p)} />
          ))}
        </datalist>
        <datalist id="invoice-units">
          {Object.values(unitText).map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        {draft.lines.map((line, i) => (
          <div key={i} className="admin-line">
            <label className="admin-line__item">
              {i + 1}. {v.description}
              <input list="invoice-products" value={line.description} onChange={(e) => pickProduct(i, e.target.value)} />
            </label>
            <label>
              {v.unit}
              <input list="invoice-units" value={line.unit} onChange={(e) => setLine(i, { unit: e.target.value })} />
            </label>
            <label>
              {v.qty}
              <input type="number" min={0} step="any" dir="ltr" value={line.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
            </label>
            <label>
              {v.unitPrice}
              <input
                type="number"
                min={0}
                step="any"
                dir="ltr"
                value={line.unit_price}
                onChange={(e) => setLine(i, { unit_price: Number(e.target.value) })}
              />
            </label>
            <span className="admin-line__amount">{formatPrice(line.qty * line.unit_price, locale)}</span>
            <button
              type="button"
              className="admin-link"
              aria-label={`${v.removeLine} ${i + 1}`}
              onClick={() => set({ lines: draft.lines.filter((_, j) => j !== i) })}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn btn--ghost" onClick={() => set({ lines: [...draft.lines, { description: "", unit: "", qty: 1, unit_price: 0 }] })}>
          {v.addLine}
        </button>
      </section>

      <section className="admin-card admin-section">
        <div className="admin-pair">
          <label>
            {v.discount}
            <input type="number" min={0} step="any" dir="ltr" value={draft.discount} onChange={(e) => set({ discount: Number(e.target.value) })} />
          </label>
          <label>
            {v.vatRate}
            <input type="number" min={0} step="any" dir="ltr" value={draft.vat_rate} onChange={(e) => set({ vat_rate: Number(e.target.value) })} />
          </label>
          <label>
            {v.stampDuty}
            <input type="number" min={0} step="any" dir="ltr" value={draft.stamp_duty} onChange={(e) => set({ stamp_duty: Number(e.target.value) })} />
          </label>
          <label>
            {v.notes}
            <input value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />
          </label>
        </div>
        <dl className="admin-totals">
          <dt>{v.subtotal}</dt>
          <dd>{formatPrice(totals.subtotal, locale)}</dd>
          {totals.vat > 0 && (
            <>
              <dt>{v.vat}</dt>
              <dd>{formatPrice(totals.vat, locale)}</dd>
            </>
          )}
          <dt>{v.net}</dt>
          <dd>
            <strong>{formatPrice(totals.net, locale)}</strong>
          </dd>
        </dl>
      </section>

      <div className="admin-savebar">
        <span />
        <span className="admin-actions">
          <button className="btn btn--primary" disabled={status === "saving"}>
            {status === "saving" ? t.common.saving : v.save}
          </button>
        </span>
        {status && status !== "saving" && (
          <p className="admin-error" role="alert">
            {status}
          </p>
        )}
      </div>
    </form>
  );
}
