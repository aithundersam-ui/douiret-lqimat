"use client";

import Link from "next/link";
import { categories } from "@/data/menu";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
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
  const usedCategories = categories.filter((c) => items.some((p) => p.category === c.id));

  return (
    <section id="menu" className="section section--tinted">
      <div className="container">
        <Heading className="section__title">{t.menu.title}</Heading>
        <p className="section__subtitle">{content.menuSubtitle[locale]}</p>
        <MenuGrid locale={locale} t={t} items={items} categories={usedCategories} showFilters={!featuredOnly} />
        {featuredOnly && (
          <p className="center">
            <Link href={`/${locale}/menu/`} className="btn btn--primary">
              {t.menu.seeAll}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
