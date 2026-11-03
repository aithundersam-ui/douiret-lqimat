"use client";

import { useEffect } from "react";
import { defaultMenuQr, menuQrPath, type MenuQrTarget } from "@/lib/site/qr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** The menu the master admin chose for the QR code; the default if it can't be read in time. */
async function loadTarget(): Promise<MenuQrTarget> {
  try {
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/qr_links?id=eq.menu&select=lang,section`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
      });
      const rows = (await res.json()) as MenuQrTarget[];
      return rows[0] ?? defaultMenuQr;
    }
    const { readDemoMenuQr } = await import("@/lib/admin/demoStore");
    return readDemoMenuQr() ?? defaultMenuQr;
  } catch {
    return defaultMenuQr;
  }
}

// Printed QR codes point here (see menuQrUrl), so they keep working whatever menu they should open.
export default function MenuQrPage() {
  useEffect(() => {
    loadTarget().then((target) => location.replace(menuQrPath(target, navigator.language)));
  }, []);

  return (
    <p style={{ textAlign: "center", marginTop: "4rem", fontFamily: "sans-serif" }}>
      <a href="/en/menu/">Menu</a> · <a href="/ar/menu/">القائمة</a> · <a href="/fr/menu/">Carte</a>
    </p>
  );
}
