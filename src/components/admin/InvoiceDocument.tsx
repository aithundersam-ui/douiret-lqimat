/* eslint-disable @next/next/no-img-element */
import { amountInWords, documentText, frDate, invoiceTotals, money, paymentText, type BusinessDetails } from "@/lib/admin/invoices";
import type { Invoice } from "@/lib/admin/types";

/**
 * The printable invoice, proforma or delivery note, laid out like the shop's invoice template:
 * French and Arabic side by side, burgundy headers, peach accents.
 * A delivery note (bon de livraison) only lists what was handed over: no prices, totals or payment.
 */
export function InvoiceDocument({ invoice, business }: { invoice: Invoice; business: BusinessDetails }) {
  const text = documentText[invoice.kind];
  const totals = invoiceTotals(invoice);
  const priced = invoice.kind !== "delivery";
  const columns = priced ? 6 : 4;
  const contact = [business.phone && `Tél : ${business.phone}`, business.email].filter(Boolean).join("  •  ");
  const ids1 = [business.rc && `RC : ${business.rc}`, business.nif && `NIF : ${business.nif}`].filter(Boolean).join("  •  ");
  const ids2 = [business.nis && `NIS : ${business.nis}`, business.ai && `AI : ${business.ai}`].filter(Boolean).join("  •  ");
  // Keep the table at least as tall as the template's, so short invoices don't look empty.
  const blankRows = Math.max(0, 8 - invoice.lines.length);

  return (
    <article className="invoice" dir="ltr" lang="fr">
      <header className="invoice__top">
        <img src="/brand/logo.webp" alt="" className="invoice__logo" />
        <div className="invoice__shop">
          <h1>
            {text.title} <span>|</span> <span lang="ar">{text.titleAr}</span>
          </h1>
          <p className="invoice__name">{business.name}</p>
          {business.slogan && <p className="invoice__slogan">{business.slogan}</p>}
          {business.address && <p>{business.address}</p>}
          {contact && <p>{contact}</p>}
          {ids1 && <p className="invoice__ids">{ids1}</p>}
          {ids2 && <p className="invoice__ids">{ids2}</p>}
        </div>
      </header>

      <div className="invoice__boxes">
        <dl>
          <div className="invoice__boxhead">
            {priced ? "FACTURÉ À" : "LIVRÉ À"} <span>|</span> <span lang="ar">{priced ? "الزبون" : "تسليم إلى"}</span>
          </div>
          <Field fr="Nom" ar="الاسم" value={invoice.customer_name} />
          <Field fr="Adresse" ar="العنوان" value={invoice.customer_address} />
          <Field fr="Téléphone" ar="الهاتف" value={invoice.customer_phone} />
          <Field fr="NIF / RC (si entreprise)" value={invoice.customer_tax_id} />
        </dl>
        <dl>
          <div className="invoice__boxhead">
            DÉTAILS <span>|</span> <span lang="ar">التفاصيل</span>
          </div>
          <Field fr={text.number} ar="رقم" value={invoice.number} strong />
          <Field fr="Date" ar="التاريخ" value={frDate(invoice.issue_date)} strong />
          <Field fr={text.due} ar={text.dueAr} value={frDate(invoice.due_date)} strong />
          {priced && <Field fr="Paiement" ar="الدفع" value={paymentText[invoice.payment_method]} strong />}
        </dl>
      </div>

      <table className="invoice__lines">
        <thead>
          <tr>
            <th>N°</th>
            <th>
              Désignation <span>|</span> <span lang="ar">البيان</span>
            </th>
            <th>Unité</th>
            <th>Qté</th>
            {priced && (
              <>
                <th>P.U. (DA)</th>
                <th>Montant (DA)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((l, i) => (
            <tr key={i}>
              <td className="c">{i + 1}</td>
              <td>{l.description}</td>
              <td className="c">{l.unit}</td>
              <td className="c">{l.qty}</td>
              {priced && (
                <>
                  <td className="r">{money(l.unit_price)}</td>
                  <td className="r">{money(l.qty * l.unit_price)}</td>
                </>
              )}
            </tr>
          ))}
          {Array.from({ length: blankRows }, (_, i) => (
            <tr key={`blank-${i}`} aria-hidden>
              <td colSpan={columns}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
        {!priced && (
          <tfoot>
            <tr>
              <th colSpan={3}>
                Total quantité <span>|</span> <span lang="ar">مجموع الكمية</span>
              </th>
              <td className="c">{invoice.lines.reduce((n, l) => n + (Number(l.qty) || 0), 0)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {priced ? (
        <>
          <div className="invoice__bottom">
            <div className="invoice__terms">
              <p className="invoice__label">
                Mode de paiement / <span lang="ar">طريقة الدفع</span>
              </p>
              <p>{paymentText[invoice.payment_method]}</p>
              {business.conditions && (
                <>
                  <p className="invoice__label">
                    Conditions / <span lang="ar">الشروط</span>
                  </p>
                  <p>{business.conditions}</p>
                </>
              )}
              {invoice.notes && <p className="invoice__notes">{invoice.notes}</p>}
            </div>
            <table className="invoice__totals">
              <tbody>
                <Total fr="Total HT" ar="المجموع" value={totals.subtotal} />
                <Total fr="Remise" ar="تخفيض" value={totals.discount} />
                <Total fr={`TVA ${invoice.vat_rate}%`} ar="ر.ق.م" value={totals.vat} />
                <Total fr="Droit de timbre" ar="حقوق الطابع" value={totals.stamp} />
                <tr className="invoice__net">
                  <th>
                    NET À PAYER <span>|</span> <span lang="ar">الصافي للدفع</span>
                  </th>
                  <td>{money(totals.net)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {business.taxNote && <p className="invoice__taxnote">{business.taxNote}</p>}

          <p className="invoice__label invoice__stop">
            {text.stop} <span>|</span> <span lang="ar">أوقفت هذه الفاتورة على مبلغ :</span>
          </p>
          <p className="invoice__words">{amountInWords(totals.net)}</p>
        </>
      ) : (
        <>
          {invoice.notes && <p className="invoice__notes">{invoice.notes}</p>}
          <p className="invoice__label invoice__stop">
            Marchandise reçue en bon état et conforme <span>|</span> <span lang="ar">تم استلام البضاعة في حالة جيدة ومطابقة</span>
          </p>
        </>
      )}

      <div className="invoice__signatures">
        {priced ? (
          <>
            <p>
              Signature du client <span>|</span> <span lang="ar">إمضاء الزبون</span>
            </p>
            <p>
              Cachet et signature <span>|</span> <span lang="ar">الختم والإمضاء</span>
            </p>
          </>
        ) : (
          <>
            <p>
              Livré par (cachet et signature) <span>|</span> <span lang="ar">المُسلِّم</span>
            </p>
            <p>
              Reçu par (nom et signature) <span>|</span> <span lang="ar">المُستلِم</span>
            </p>
          </>
        )}
      </div>

      <footer className="invoice__footer">
        <p className="invoice__thanks">
          Merci de votre confiance • <span lang="ar">شكراً لثقتكم</span>
        </p>
        {priced && business.rib && <p>RIB / CCP : {business.rib}</p>}
      </footer>
    </article>
  );
}

function Field({ fr, ar, value, strong }: { fr: string; ar?: string; value: string; strong?: boolean }) {
  return (
    <div className="invoice__field">
      <dt>
        {fr}
        {ar && (
          <>
            {" / "}
            <span lang="ar">{ar}</span>
          </>
        )}
      </dt>
      <dd className={strong ? "is-strong" : undefined}>{value || " "}</dd>
    </div>
  );
}

function Total({ fr, ar, value }: { fr: string; ar: string; value: number }) {
  return (
    <tr>
      <th>
        {fr} <span>|</span> <span lang="ar">{ar}</span>
      </th>
      <td>{money(value)}</td>
    </tr>
  );
}
