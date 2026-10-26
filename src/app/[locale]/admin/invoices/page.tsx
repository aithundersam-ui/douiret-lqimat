"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { invoiceTotals, withBusinessDefaults, type BusinessDetails } from "@/lib/admin/invoices";
import type { Invoice, InvoiceKind } from "@/lib/admin/types";
import { formatPrice } from "@/lib/i18n";

export default function InvoicesPage() {
  const { store, t, locale } = useAdmin();
  const v = t.invoices;
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [filter, setFilter] = useState<"all" | InvoiceKind>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    store
      .list("invoices")
      .then(setInvoices)
      .catch((err) => setError((err as Error).message));
  }, [store]);

  const shown = (invoices ?? [])
    .filter((i) => filter === "all" || i.kind === filter)
    .sort((a, b) => b.issue_date.localeCompare(a.issue_date) || b.number.localeCompare(a.number));
  const base = `/${locale}/admin/invoices`;

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.invoices}</h1>
        <div className="admin-actions">
          <Link className="btn btn--primary" href={`${base}/edit/?kind=invoice`}>
            + {v.newInvoice}
          </Link>
          <Link className="btn btn--ghost" href={`${base}/edit/?kind=proforma`}>
            + {v.newProforma}
          </Link>
          <Link className="btn btn--ghost" href={`${base}/edit/?kind=delivery`}>
            + {v.newDelivery}
          </Link>
        </div>
      </div>

      <div className="admin-segment admin-segment--start" role="tablist">
        {(["all", "invoice", "proforma", "delivery"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>
            {{ all: v.all, invoice: v.invoices, proforma: v.proformas, delivery: v.deliveries }[k]}
          </button>
        ))}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {t.common.error} {error}
        </p>
      )}
      {!invoices && !error && <p>{t.common.loading}</p>}
      {invoices && shown.length === 0 && <p className="admin-empty">{t.common.empty}</p>}

      <ul className="admin-list">
        {shown.map((inv) => (
          <li key={inv.id}>
            <Link className="admin-row" href={`${base}/view/?id=${inv.id}`}>
              <span className="admin-row__main">
                <strong>
                  {inv.number} · {inv.customer_name || "—"}
                </strong>
                <span>
                  {{ invoice: v.invoice, proforma: v.proforma, delivery: v.delivery }[inv.kind]} · {inv.issue_date}
                </span>
              </span>
              <span className="admin-row__aside">{formatPrice(invoiceTotals(inv).net, locale)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <BusinessForm />
    </>
  );
}

const fields = ["name", "slogan", "address", "phone", "email", "rc", "nif", "nis", "ai", "rib", "vatRate", "taxNote", "conditions", "invoicePrefix", "proformaPrefix", "deliveryPrefix"] as const;

function BusinessForm() {
  const { store, t } = useAdmin();
  const v = t.invoices;
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    store.getBusiness().then((saved) => setDetails(withBusinessDefaults(saved)), (err) => setStatus((err as Error).message));
  }, [store]);

  if (!details) return null;
  const labels: Record<(typeof fields)[number], string> = {
    name: v.businessName,
    slogan: v.slogan,
    address: v.address,
    phone: v.phone,
    email: v.email,
    rc: v.rc,
    nif: v.nif,
    nis: v.nis,
    ai: v.ai,
    rib: v.rib,
    vatRate: v.defaultVat,
    taxNote: v.taxNote,
    conditions: v.conditions,
    invoicePrefix: v.invoicePrefix,
    proformaPrefix: v.proformaPrefix,
    deliveryPrefix: v.deliveryPrefix,
  };

  return (
    <details className="admin-card admin-business">
      <summary>{v.business}</summary>
      <p className="admin-hint">{v.businessHint}</p>
      <form
        className="admin-pair"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("saving");
          try {
            await store.saveBusiness(details);
            setStatus("saved");
          } catch (err) {
            setStatus((err as Error).message);
          }
        }}
      >
        {fields.map((f) => (
          <label key={f}>
            {labels[f]}
            {f === "vatRate" ? (
              <input
                type="number"
                min={0}
                step="any"
                dir="ltr"
                value={details.vatRate}
                onChange={(e) => setDetails({ ...details, vatRate: Number(e.target.value) })}
              />
            ) : (
              <input value={details[f]} onChange={(e) => setDetails({ ...details, [f]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="admin-form__actions" style={{ gridColumn: "1 / -1" }}>
          <button className="btn btn--primary" disabled={status === "saving"}>
            {status === "saving" ? t.common.saving : v.saveBusiness}
          </button>
          {status === "saved" && <span>✓ {t.common.saved}</span>}
        </div>
        {!["", "saving", "saved"].includes(status) && (
          <p className="admin-error" role="alert" style={{ gridColumn: "1 / -1" }}>
            {t.common.error} {status}
          </p>
        )}
      </form>
    </details>
  );
}
