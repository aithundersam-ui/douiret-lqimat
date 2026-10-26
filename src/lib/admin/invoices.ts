import { shop } from "@/data/shop";
import type { Unit } from "@/data/menu";
import type { Invoice, InvoiceKind, PaymentMethod } from "./types";

/** The shop's details printed on every invoice, edited once on the Invoices screen. */
export type BusinessDetails = {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  rc: string;
  nif: string;
  nis: string;
  ai: string;
  rib: string;
  /** Percent; 0 when the shop is not subject to VAT (e.g. IFU). */
  vatRate: number;
  taxNote: string;
  conditions: string;
  invoicePrefix: string;
  proformaPrefix: string;
  deliveryPrefix: string;
};

export const defaultBusiness: BusinessDetails = {
  name: "Douiret Lqimat - دويرة اللقيمات",
  slogan: "مملحات وحلويات تقليدية جزائرية وعصرية",
  address: shop.address.fr,
  phone: shop.phone,
  email: "",
  rc: "",
  nif: "",
  nis: "",
  ai: "",
  rib: "",
  vatRate: 0,
  taxNote: "",
  conditions: "Paiement à la livraison / الدفع عند الاستلام",
  invoicePrefix: "FAC",
  proformaPrefix: "PRO",
  deliveryPrefix: "BL",
};

export function withBusinessDefaults(saved: Partial<BusinessDetails> | null | undefined): BusinessDetails {
  return { ...defaultBusiness, ...(saved ?? {}) };
}

// The printed document follows the shop's template: French and Arabic side by side.
export const documentText = {
  invoice: { title: "FACTURE", titleAr: "فاتورة", number: "N° facture", due: "Échéance", dueAr: "الاستحقاق", stop: "Arrêtée la présente facture à la somme de", stopAr: "أوقفت هذه الفاتورة على مبلغ :", net: "NET À PAYER", netAr: "الصافي للدفع" },
  proforma: { title: "FACTURE PROFORMA", titleAr: "فاتورة شكلية", number: "N° proforma", due: "Valable jusqu'au", dueAr: "صالحة إلى غاية", stop: "Arrêtée la présente facture proforma à la somme de", stopAr: "أوقفت هذه الفاتورة على مبلغ :", net: "NET À PAYER", netAr: "الصافي للدفع" },
  delivery: { title: "BON DE LIVRAISON", titleAr: "وصل التسليم", number: "N° BL", due: "Date de livraison", dueAr: "تاريخ التسليم", stop: "Arrêté le présent bon de livraison à la somme de", stopAr: "أوقف هذا الوصل على مبلغ :", net: "MONTANT TOTAL", netAr: "المبلغ الإجمالي" },
} as const;

const prefixField = { invoice: "invoicePrefix", proforma: "proformaPrefix", delivery: "deliveryPrefix" } as const;

export const paymentText: Record<PaymentMethod, string> = {
  cash: "Espèces / نقداً",
  transfer: "Virement bancaire / تحويل بنكي",
  ccp: "CCP / BaridiMob",
  cheque: "Chèque / صك",
};

export const unitText: Record<Unit, string> = { piece: "pièce", kg: "kg", box: "boîte", tray: "plateau" };

/** Next free number for the year, like FAC-2026-0007 or BL-2026-0003. */
export function nextNumber(kind: InvoiceKind, existing: Pick<Invoice, "number">[], business: BusinessDetails, day: string) {
  const prefix = `${business[prefixField[kind]]}-${day.slice(0, 4)}-`;
  let max = 0;
  for (const { number } of existing) {
    if (number.startsWith(prefix)) max = Math.max(max, Number(number.slice(prefix.length)) || 0);
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function invoiceTotals(inv: Pick<Invoice, "lines" | "discount" | "vat_rate" | "stamp_duty">) {
  const subtotal = round2(inv.lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unit_price) || 0), 0));
  const discount = Number(inv.discount) || 0;
  const vat = round2(((subtotal - discount) * (Number(inv.vat_rate) || 0)) / 100);
  const stamp = Number(inv.stamp_duty) || 0;
  return { subtotal, discount, vat, stamp, net: round2(subtotal - discount + vat + stamp) };
}

/** 1920 → "1,920.00 DA", as on the shop's invoice template. */
export function money(n: number) {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;
}

/** 2026-10-14 → 14/10/2026 */
export function frDate(day: string) {
  const [y, m, d] = day.split("-");
  return d && m && y ? `${d}/${m}/${y}` : day;
}

// Amount in words, in French, for the "Arrêtée la présente facture à la somme de" line.
const small = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

function below100(n: number): string {
  if (n < 17) return small[n];
  if (n < 20) return `dix-${small[n - 10]}`;
  if (n < 70) {
    const u = n % 10;
    return tens[Math.floor(n / 10)] + (u === 0 ? "" : u === 1 ? " et un" : `-${small[u]}`);
  }
  if (n < 80) return n === 71 ? "soixante et onze" : `soixante-${below100(n - 60)}`;
  return n === 80 ? "quatre-vingts" : `quatre-vingt-${below100(n - 80)}`;
}

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const hundreds = h === 0 ? "" : h === 1 ? "cent" : `${small[h]} cent${r === 0 ? "s" : ""}`;
  return [hundreds, r ? below100(r) : ""].filter(Boolean).join(" ");
}

export function frenchNumber(n: number): string {
  if (n === 0) return "zéro";
  const parts: string[] = [];
  const billions = Math.floor(n / 1e9);
  const millions = Math.floor(n / 1e6) % 1000;
  const thousands = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;
  if (billions) parts.push(`${below1000(billions)} milliard${billions > 1 ? "s" : ""}`);
  if (millions) parts.push(`${below1000(millions)} million${millions > 1 ? "s" : ""}`);
  // "mille" never takes an s, and "cents"/"vingts" lose theirs in front of it.
  if (thousands) parts.push(thousands === 1 ? "mille" : `${below1000(thousands).replace(/(cent|vingt)s$/, "$1")} mille`);
  if (rest) parts.push(below1000(rest));
  return parts.join(" ");
}

export function amountInWords(amount: number) {
  const dinars = Math.floor(amount);
  const centimes = Math.round((amount - dinars) * 100);
  const text = `${frenchNumber(dinars)} ${dinars > 1 ? "dinars algériens" : "dinar algérien"}${
    centimes ? ` et ${frenchNumber(centimes)} centime${centimes > 1 ? "s" : ""}` : ""
  }`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
