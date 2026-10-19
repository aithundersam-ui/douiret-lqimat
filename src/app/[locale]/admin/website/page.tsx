"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { CrudPage, ImageInput } from "@/components/admin/CrudPage";
import type { Localized } from "@/lib/i18n";
import { withDefaults, type HomeContent } from "@/lib/site/content";

export default function WebsitePage() {
  const { store, t, locale } = useAdmin();
  const w = t.website;
  const [content, setContent] = useState<HomeContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | string>("idle");

  useEffect(() => {
    store
      .getContent()
      .then((saved) => setContent(withDefaults(saved)))
      .catch((err) => setStatus((err as Error).message));
  }, [store]);

  if (!content) {
    return status === "idle" ? (
      <p>{t.common.loading}</p>
    ) : (
      <p className="admin-error" role="alert">
        {t.common.error} {status}
      </p>
    );
  }

  function set<K extends keyof HomeContent>(key: K, value: HomeContent[K]) {
    setContent({ ...content!, [key]: value });
    setDirty(true);
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    try {
      await store.saveContent(content!);
      setDirty(false);
      setStatus("saved");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  const pair = (label: string, value: Localized, onChange: (v: Localized) => void, multiline = false) => (
    <Pair label={label} value={value} onChange={onChange} multiline={multiline} ar={w.arabic} fr={w.french} />
  );

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.website}</h1>
        <Link href={`/${locale}/`} className="btn btn--ghost" target="_blank">
          {w.open} ↗
        </Link>
      </div>
      <p className="admin-hint">{w.intro}</p>

      <section className="admin-card admin-section">
        <h2>{w.top}</h2>
        {pair(w.tagline, content.tagline, (v) => set("tagline", v))}
        {pair(w.heroTitle, content.heroTitle, (v) => set("heroTitle", v))}
        {pair(w.heroText, content.heroText, (v) => set("heroText", v), true)}
      </section>

      <section className="admin-card admin-section">
        <h2>{w.about}</h2>
        {pair(w.sectionTitle, content.aboutTitle, (v) => set("aboutTitle", v))}
        {content.about.map((card, i) => {
          const update = (patch: Partial<HomeContent["about"][number]>) =>
            set("about", content.about.map((c, j) => (j === i ? { ...c, ...patch } : c)));
          return (
            <div key={i} className="admin-subcard">
              <div className="admin-subcard__head">
                <span>
                  {w.card} {i + 1}
                </span>
                <label>
                  {w.icon} <input value={card.icon} onChange={(e) => update({ icon: e.target.value })} maxLength={4} />
                </label>
                <button type="button" className="admin-link" onClick={() => set("about", content.about.filter((_, j) => j !== i))}>
                  {w.remove}
                </button>
              </div>
              {pair(w.cardTitle, card.title, (v) => update({ title: v }))}
              {pair(w.cardText, card.text, (v) => update({ text: v }), true)}
            </div>
          );
        })}
        {content.about.length < 6 && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => set("about", [...content.about, { icon: "⭐", title: { ar: "", fr: "" }, text: { ar: "", fr: "" } }])}
          >
            + {t.common.add}
          </button>
        )}
      </section>

      <section className="admin-card admin-section">
        <h2>{w.menu}</h2>
        {pair(w.menuSubtitle, content.menuSubtitle, (v) => set("menuSubtitle", v))}
        <p className="admin-hint">
          {w.menuHint} <Link href={`/${locale}/admin/products/`}>{t.nav.products} →</Link>
        </p>
      </section>

      <section className="admin-card admin-section">
        <h2>{w.contact}</h2>
        <div className="admin-pair">
          <label>
            {w.phone}
            <input type="tel" dir="ltr" value={content.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
          <label>
            {w.whatsapp}
            <input
              inputMode="numeric"
              dir="ltr"
              value={content.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))}
            />
          </label>
        </div>
        {pair(w.address, content.address, (v) => set("address", v))}
        <div className="admin-pair">
          <label style={{ gridColumn: "1 / -1" }}>
            {w.mapUrl}
            <input type="url" dir="ltr" value={content.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} />
          </label>
        </div>

        <p className="admin-pair__label">{w.hours}</p>
        {content.hours.map((h, i) => {
          const update = (patch: Partial<HomeContent["hours"][number]>) =>
            set("hours", content.hours.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <div key={i} className="admin-row-inputs">
              <label>
                {w.days} ({w.arabic})
                <input value={h.days.ar} onChange={(e) => update({ days: { ...h.days, ar: e.target.value } })} />
              </label>
              <label>
                {w.days} ({w.french})
                <input value={h.days.fr} onChange={(e) => update({ days: { ...h.days, fr: e.target.value } })} />
              </label>
              <label>
                {w.time}
                <input dir="ltr" value={h.time} onChange={(e) => update({ time: e.target.value })} />
              </label>
              <button type="button" className="admin-link" onClick={() => set("hours", content.hours.filter((_, j) => j !== i))}>
                {w.remove}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => set("hours", [...content.hours, { days: { ar: "", fr: "" }, time: "" }])}
        >
          {w.addHours}
        </button>

        <div className="admin-pair" style={{ marginTop: "1rem" }}>
          <label>
            {w.instagram}
            <input type="url" dir="ltr" value={content.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </label>
          <label>
            {w.facebook}
            <input type="url" dir="ltr" value={content.facebook} onChange={(e) => set("facebook", e.target.value)} />
          </label>
        </div>
        {pair(w.preorderNote, content.preorderNote, (v) => set("preorderNote", v), true)}
      </section>

      <section className="admin-card admin-section">
        <h2>{w.team}</h2>
        {pair(w.teamSubtitle, content.teamSubtitle, (v) => set("teamSubtitle", v))}
        <CrudPage
          table="team_members"
          title={w.team}
          headingLevel={2}
          fields={[
            { key: "name_ar", label: `${w.memberName} (${w.arabic})`, type: "text", required: true },
            { key: "name_fr", label: `${w.memberName} (${w.french})`, type: "text" },
            { key: "role_ar", label: `${w.memberRole} (${w.arabic})`, type: "text" },
            { key: "role_fr", label: `${w.memberRole} (${w.french})`, type: "text" },
            { key: "photo_url", label: t.website.addPhoto, type: "image" },
            { key: "sort", label: w.order, type: "number" },
          ]}
          emptyRow={() => ({ name_ar: "", name_fr: "", role_ar: "", role_fr: "", photo_url: "", sort: 0 })}
          sort={(a, b) => a.sort - b.sort}
          card={(m) => ({
            title: (
              <span className="admin-member">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.photo_url ? <img src={m.photo_url} alt="" /> : <span aria-hidden>{m.name_ar.charAt(0)}</span>}
                {locale === "ar" ? m.name_ar : m.name_fr || m.name_ar}
              </span>
            ),
            subtitle: locale === "ar" ? m.role_ar : m.role_fr || m.role_ar,
            aside: `#${m.sort}`,
          })}
        />
      </section>

      <div className="admin-savebar">
        <span>{dirty ? w.unsaved : status === "saved" ? `✓ ${t.common.saved}` : ""}</span>
        <button className="btn btn--primary" onClick={save} disabled={status === "saving" || !dirty}>
          {status === "saving" ? t.common.saving : w.save}
        </button>
        {!["idle", "saving", "saved"].includes(status) && (
          <p className="admin-error" role="alert">
            {t.common.error} {status}
          </p>
        )}
      </div>
    </>
  );
}

function Pair({
  label,
  value,
  onChange,
  multiline,
  ar,
  fr,
}: {
  label: string;
  value: Localized;
  onChange: (v: Localized) => void;
  multiline: boolean;
  ar: string;
  fr: string;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="admin-pair">
      <span className="admin-pair__label">{label}</span>
      <label>
        {ar}
        <Input dir="rtl" lang="ar" rows={multiline ? 3 : undefined} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
      </label>
      <label>
        {fr}
        <Input dir="ltr" lang="fr" rows={multiline ? 3 : undefined} value={value.fr} onChange={(e) => onChange({ ...value, fr: e.target.value })} />
      </label>
    </div>
  );
}
