import type { Dictionary } from "@/lib/dictionary";

const icons = ["🍯", "🧁", "🥟", "🎉"];

export function About({ t }: { t: Dictionary }) {
  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section__title">{t.about.title}</h2>
        <div className="about__grid">
          {t.about.items.map((item, i) => (
            <article key={item.title} className="card about__card">
              <span className="about__icon" aria-hidden>
                {icons[i]}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
