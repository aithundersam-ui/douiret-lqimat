import Image from "next/image";
import { team } from "@/data/team";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Team({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="team" className="section">
      <div className="container">
        <h2 className="section__title">{t.team.title}</h2>
        <p className="section__subtitle">{t.team.subtitle}</p>
        <ul className="team__grid">
          {team.map((m, i) => (
            <li key={i} className="team__member">
              <div className="team__photo">
                {m.photo ? (
                  <Image src={m.photo} alt={m.name[locale]} fill sizes="160px" />
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
