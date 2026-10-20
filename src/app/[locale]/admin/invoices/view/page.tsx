"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { InvoiceDocument } from "@/components/admin/InvoiceDocument";
import { withBusinessDefaults, type BusinessDetails } from "@/lib/admin/invoices";
import type { Invoice } from "@/lib/admin/types";

export default function ViewInvoicePage() {
  return (
    <Suspense>
      <ViewInvoice />
    </Suspense>
  );
}

function ViewInvoice() {
  const { store, t, locale } = useAdmin();
  const v = t.invoices;
  const id = useSearchParams().get("id");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([store.list("invoices"), store.getBusiness()])
      .then(([invoices, saved]) => {
        const found = invoices.find((i) => i.id === id);
        if (!found) setStatus(v.notFound);
        setInvoice(found ?? null);
        setBusiness(withBusinessDefaults(saved));
      })
      .catch((err) => setStatus((err as Error).message));
  }, [store, id, v.notFound]);

  // The file name the browser suggests when saving as PDF comes from the page title.
  useEffect(() => {
    if (invoice) document.title = `${invoice.number} ${invoice.customer_name}`.trim();
  }, [invoice]);

  const base = `/${locale}/admin/invoices`;

  if (status) {
    return (
      <>
        <p className="admin-error" role="alert">
          {status}
        </p>
        <Link href={`${base}/`}>{v.back}</Link>
      </>
    );
  }
  if (!invoice || !business) return <p>{t.common.loading}</p>;

  return (
    <>
      <div className="admin-head no-print">
        <Link href={`${base}/`} className="btn btn--ghost">
          {v.back}
        </Link>
        <div className="admin-actions">
          <Link href={`${base}/edit/?id=${invoice.id}`} className="btn btn--ghost">
            {v.edit}
          </Link>
          {invoice.kind === "proforma" && (
            <Link href={`${base}/edit/?from=${invoice.id}`} className="btn btn--ghost">
              {v.toInvoice}
            </Link>
          )}
          <button className="btn btn--primary" onClick={() => window.print()}>
            {v.print}
          </button>
        </div>
      </div>
      <p className="admin-hint no-print">{v.printHint}</p>
      <div className="invoice-wrap">
        <InvoiceDocument invoice={invoice} business={business} />
      </div>
    </>
  );
}
