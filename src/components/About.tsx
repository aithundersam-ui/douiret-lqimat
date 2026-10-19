"use client";

import type { Locale } from "@/lib/i18n";
import { useSiteData } from "./SiteData";

export function About({ locale }: { locale: Locale }) {
  const { content } = useSiteData();
  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section__title">{content.aboutTitle[locale]}</h2>
        <div className="about__grid">
          {content.about.map((item, i) => (
            <article key={i} className="card about__card">
              <span className="about__icon" aria-hidden>
                {item.icon}
              </span>
              <h3>{item.title[locale]}</h3>
              <p>{item.text[locale]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
