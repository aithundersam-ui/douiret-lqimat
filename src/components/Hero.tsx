"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { useSiteData } from "./SiteData";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { content } = useSiteData();
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <p className="eyebrow">{content.tagline[locale]}</p>
          <h1>{content.heroTitle[locale]}</h1>
          <p>{content.heroText[locale]}</p>
          <div className="hero__actions">
            <Link href={`/${locale}/menu/`} className="btn btn--primary">
              {t.hero.seeMenu}
            </Link>
            <a href={`https://wa.me/${content.whatsapp}`} className="btn btn--ghost" target="_blank" rel="noopener">
              {t.hero.order}
            </a>
          </div>
        </div>
        <div className="hero__logo">
          <Image src="/brand/logo.webp" alt={t.shopName} width={420} height={420} priority />
        </div>
      </div>
    </section>
  );
}
