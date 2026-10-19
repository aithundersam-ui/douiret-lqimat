"use client";

import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { useSiteData } from "./SiteData";

export function Contact({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { content: c } = useSiteData();
  return (
    <section id="contact" className="section section--brand">
      <div className="container">
        <h2 className="section__title">{t.contact.title}</h2>
        <div className="contact__grid">
          <div>
            <h3>{t.contact.address}</h3>
            <p>
              <a href={c.mapUrl} target="_blank" rel="noopener">
                {c.address[locale]}
              </a>
            </p>
          </div>
          <div>
            <h3>{t.contact.hours}</h3>
            {c.hours.map((h, i) => (
              <p key={i}>
                {h.days[locale]} <bdi dir="ltr">{h.time}</bdi>
              </p>
            ))}
          </div>
          <div>
            <h3>{t.contact.phone}</h3>
            <p>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} dir="ltr">
                {c.phone}
              </a>
            </p>
            {(c.instagram || c.facebook) && (
              <>
                <h3>{t.contact.follow}</h3>
                <p className="contact__social">
                  {c.instagram && (
                    <a href={c.instagram} target="_blank" rel="noopener">
                      Instagram
                    </a>
                  )}
                  {c.facebook && (
                    <a href={c.facebook} target="_blank" rel="noopener">
                      Facebook
                    </a>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
        <p className="contact__note">{c.preorderNote[locale]}</p>
      </div>
    </section>
  );
}
