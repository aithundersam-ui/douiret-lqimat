import { shop } from "@/data/shop";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Contact({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="contact" className="section section--brand">
      <div className="container">
        <h2 className="section__title">{t.contact.title}</h2>
        <div className="contact__grid">
          <div>
            <h3>{t.contact.address}</h3>
            <p>
              <a href={shop.mapUrl} target="_blank" rel="noopener">
                {shop.address[locale]}
              </a>
            </p>
          </div>
          <div>
            <h3>{t.contact.hours}</h3>
            {shop.hours.map((h) => (
              <p key={h.days.fr}>
                {h.days[locale]} <bdi dir="ltr">{h.time}</bdi>
              </p>
            ))}
          </div>
          <div>
            <h3>{t.contact.phone}</h3>
            <p>
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`} dir="ltr">
                {shop.phone}
              </a>
            </p>
            <h3>{t.contact.follow}</h3>
            <p className="contact__social">
              <a href={shop.social.instagram} target="_blank" rel="noopener">Instagram</a>
              <a href={shop.social.facebook} target="_blank" rel="noopener">Facebook</a>
            </p>
          </div>
        </div>
        <p className="contact__note">{t.contact.preorder}</p>
      </div>
    </section>
  );
}
