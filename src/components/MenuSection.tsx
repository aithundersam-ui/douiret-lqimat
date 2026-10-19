import Link from "next/link";
import { categories, type Product } from "@/data/menu";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { MenuGrid } from "./MenuGrid";

export function MenuSection({
  locale,
  t,
  items,
  showFilters,
  seeAllLink = false,
  headingLevel = 2,
}: {
  locale: Locale;
  t: Dictionary;
  items: Product[];
  showFilters: boolean;
  seeAllLink?: boolean;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const usedCategories = categories.filter((c) => items.some((p) => p.category === c.id));

  return (
    <section id="menu" className="section section--tinted">
      <div className="container">
        <Heading className="section__title">{t.menu.title}</Heading>
        <p className="section__subtitle">{t.menu.subtitle}</p>
        <MenuGrid locale={locale} t={t} items={items} categories={usedCategories} showFilters={showFilters} />
        {seeAllLink && (
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
