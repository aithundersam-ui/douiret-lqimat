"use client";

import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { useSiteData } from "./SiteData";

export function Team({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { content, team } = useSiteData();
  return (
    <section id="team" className="section">
      <div className="container">
        <h2 className="section__title">{t.team.title}</h2>
        <p className="section__subtitle">{content.teamSubtitle[locale]}</p>
        <ul className="team__grid">
          {team.map((m, i) => (
            <li key={i} className="team__member">
              <div className="team__photo">
                {m.photo ? (
                  // Photos can live on Supabase Storage, so use a plain <img>.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name[locale]} loading="lazy" />
                ) : (
                  <span aria-hidden>{m.name[locale].charAt(0)}</span>
                )}
              </div>
              <h3>{m.name[locale]}</h3>
              <p>{m.role[locale]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
