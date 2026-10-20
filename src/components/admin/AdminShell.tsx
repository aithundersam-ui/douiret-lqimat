"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminDictionary } from "@/lib/admin/dictionary";
import { getStore, type Store } from "@/lib/admin/store";
import type { StaffRole } from "@/lib/admin/types";
import { languageNames, type AdminLocale } from "@/lib/i18n";
import { AdminContext } from "./AdminContext";
import { Login } from "./Login";

export function AdminShell({ locale, children }: { locale: AdminLocale; children: React.ReactNode }) {
  const t = getAdminDictionary(locale);
  const pathname = usePathname() ?? "";
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [role, setRole] = useState<StaffRole>("staff");

  useEffect(() => {
    getStore().then(async (s) => {
      setStore(s);
      setUser(await s.currentUser());
    });
  }, []);

  // Only the master admin sees the Members tab.
  useEffect(() => {
    if (store && user) store.currentRole().then(setRole, () => setRole("staff"));
  }, [store, user]);

  if (!store || user === undefined) return <p className="admin-loading">{t.common.loading}</p>;
  if (!user) return <Login store={store} t={t} onSignedIn={setUser} />;

  const base = `/${locale}/admin`;
  const tabs = [
    { href: `${base}/`, label: t.nav.dashboard },
    { href: `${base}/today/`, label: t.nav.today },
    { href: `${base}/orders/`, label: t.nav.orders },
    { href: `${base}/invoices/`, label: t.nav.invoices },
    { href: `${base}/products/`, label: t.nav.products },
    { href: `${base}/purchases/`, label: t.nav.purchases },
    { href: `${base}/expenses/`, label: t.nav.expenses },
    { href: `${base}/website/`, label: t.nav.website },
    ...(role === "master" ? [{ href: `${base}/members/`, label: t.nav.members }] : []),
  ];
  const other: AdminLocale = locale === "ar" ? "en" : "ar";
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <AdminContext.Provider value={{ store, t, locale, role }}>
      <div className="admin">
        <header className="admin-top">
          <Link href={`/${locale}/`} className="admin-top__brand">
            <Image src="/brand/logo.webp" alt="" width={36} height={36} />
            <span>{t.title}</span>
          </Link>
          <div className="admin-top__actions">
            <Link href={current.replace(`/${locale}/`, `/${other}/`)} lang={other}>
              {languageNames[other]}
            </Link>
            <button
              type="button"
              onClick={async () => {
                await store.signOut();
                setUser(null);
              }}
            >
              {t.nav.signOut}
            </button>
          </div>
        </header>

        <nav className="admin-tabs">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} aria-current={(tab.href === `${base}/` ? current === tab.href : current.startsWith(tab.href)) ? "page" : undefined}>
              {tab.label}
            </Link>
          ))}
        </nav>

        {store.mode === "demo" && <p className="admin-demo">{t.demoBanner}</p>}

        <main className="admin-main">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}
