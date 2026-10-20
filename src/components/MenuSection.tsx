"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, menuOf, menus, type MenuId, type Product } from "@/data/menu";
import type { Dictionary } from "@/lib/dictionary";
import { pick, type Locale } from "@/lib/i18n";
import { MenuGrid } from "./MenuGrid";
import { useSiteData } from "./SiteData";

export function MenuSection({
  locale,
  t,
  featuredOnly,
  headingLevel = 2,
}: {
  locale: Locale;
  t: Dictionary;
  /** Home page: only the products marked "show on home page" (or the first six). */
  featuredOnly: boolean;
  headingLevel?: 1 | 2;
}) {
  const { content, products } = useSiteData();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const featured = products.filter((p) => p.featured);
  const items = featuredOnly ? (featured.length ? featured : products.slice(0, 6)) : products;
  const groups = menus
    .map((m) => ({ ...m, items: items.filter((p) => menuOf(p.category) === m.id) }))
    .filter((m) => m.items.length > 0);

  return (
    <section id="menu" className="section section--tinted">
      <div className="container">
        <Heading className="section__title">{t.menu.title}</Heading>
        <p className="section__subtitle">{pick(content.menuSubtitle, locale)}</p>
        {featuredOnly ? (
          groups.map((m) => (
            <div key={m.id} className="menu__group">
              <h3 className="menu__group-title">{t.menu.menus[m.id]}</h3>
              <MenuGrid locale={locale} t={t} items={m.items} categories={[]} showFilters={false} />
              <p className="center">
                <Link href={`/${locale}/menu/#${m.id}`} className="btn btn--primary">
                  {t.menu.see[m.id]}
                </Link>
              </p>
            </div>
          ))
        ) : (
          <FullMenu locale={locale} t={t} groups={groups} />
        )}
      </div>
    </section>
  );
}

/** The menu page: a switch between the sweets menu and the salty menu, each with its own category filters. */
function FullMenu({
  locale,
  t,
  groups,
}: {
  locale: Locale;
  t: Dictionary;
  groups: ((typeof menus)[number] & { items: Product[] })[];
}) {
  const [active, setActive] = useState<MenuId>("sweets");

  // Links like /menu/#salty open that menu.
  useEffect(() => {
    const fromHash = () => {
      const hash = location.hash.slice(1);
      if (menus.some((m) => m.id === hash)) setActive(hash as MenuId);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const group = groups.find((g) => g.id === active) ?? groups[0];
  if (!group) return <p className="center">{t.menu.empty}</p>;

  return (
    <>
      <div className="menu__switch" role="tablist">
        {groups.map((g) => (
          <button
            key={g.id}
            id={g.id}
            role="tab"
            aria-selected={g.id === group.id}
            onClick={() => {
              setActive(g.id);
              history.replaceState(null, "", `#${g.id}`);
            }}
          >
            {t.menu.menus[g.id]}
          </button>
        ))}
      </div>
      <MenuGrid
        key={group.id}
        locale={locale}
        t={t}
        items={group.items}
        categories={categories.filter((c) => group.categories.includes(c.id) && group.items.some((p) => p.category === c.id))}
        showFilters
      />
    </>
  );
}
