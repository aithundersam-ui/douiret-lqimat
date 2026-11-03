"use client";

import { Playfair_Display } from "next/font/google";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Poster } from "@/components/admin/Poster";
import { isList, posterContent, posters, posterThemes, type PosterContent, type PosterItem, type PosterKind, type PosterTheme } from "@/lib/admin/posters";
import { menuQrUrl } from "@/lib/site/qr";
import "../../../posters.css";

// The French lines on the posters use Playfair Display, like the poster designs.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "700"], style: ["normal", "italic"], variable: "--font-playfair" });

type Drafts = Record<PosterKind, PosterContent>;

export default function PostersPage() {
  const { store, t, locale, role } = useAdmin();
  const p = t.posters;
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [saved, setSaved] = useState<Drafts | null>(null);
  const [kind, setKind] = useState<PosterKind>("welcome");
  const [theme, setTheme] = useState<PosterTheme>("white");
  const [qrSvg, setQrSvg] = useState("");
  const [printing, setPrinting] = useState<PosterKind[] | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (role !== "master") return;
    store.getPosters().then(
      (stored) => {
        const all = Object.fromEntries(posters.map((spec) => [spec.id, posterContent(spec, stored[spec.id])])) as Drafts;
        setDrafts(all);
        setSaved(all);
      },
      (err) => setStatus((err as Error).message),
    );
    QRCode.toString(menuQrUrl, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: { dark: "#72252A", light: "#FFFFFF" } }).then(setQrSvg);
  }, [store, role]);

  // Print once the posters to print are on the page.
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(null);
    window.addEventListener("afterprint", done, { once: true });
    requestAnimationFrame(() => document.fonts.ready.then(() => window.print()));
    return () => window.removeEventListener("afterprint", done);
  }, [printing]);

  if (role !== "master") return <p className="admin-hint">{p.onlyMaster}</p>;
  if (!drafts || !saved) return status ? <p className="admin-error">{t.common.error} {status}</p> : <p>{t.common.loading}</p>;

  const spec = posters.find((s) => s.id === kind)!;
  const content = drafts[kind];
  const changed = JSON.stringify(content) !== JSON.stringify(saved[kind]);
  const set = (patch: PosterContent) => setDrafts({ ...drafts, [kind]: { ...content, ...patch } });

  async function save(next: PosterContent) {
    setStatus("saving");
    try {
      await store.savePoster(kind, next);
      setSaved({ ...saved!, [kind]: next });
      setDrafts({ ...drafts!, [kind]: next });
      setStatus("saved");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  return (
    <div className={playfair.variable}>
      <div className="poster-screen">
        <div className="admin-head">
          <h1>{t.nav.posters}</h1>
          <div className="admin-actions">
            <button className="btn btn--primary" onClick={() => setPrinting([kind])}>
              {p.print}
            </button>
            <button className="btn btn--ghost" onClick={() => setPrinting(posters.map((s) => s.id))}>
              {p.printAll}
            </button>
          </div>
        </div>
        <p className="admin-hint">{p.intro}</p>
        <p className="admin-hint">{p.printHint}</p>

        <div className="admin-posters">
          <form
            className="admin-card admin-section admin-posters__form"
            onSubmit={(e) => {
              e.preventDefault();
              save(content);
            }}
          >
            <label>
              {p.poster}
              <select value={kind} onChange={(e) => (setKind(e.target.value as PosterKind), setStatus(""))}>
                {posters.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}. {s.name[locale]}
                    {JSON.stringify(drafts[s.id]) !== JSON.stringify(saved[s.id]) ? " •" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="admin-posters__label">{p.colour}</span>
              <div className="admin-segment admin-segment--start" role="tablist">
                {posterThemes.map((th) => (
                  <button key={th} type="button" role="tab" aria-selected={theme === th} onClick={() => setTheme(th)}>
                    {p.colours[th]}
                  </button>
                ))}
              </div>
            </div>

            <h2>{p.texts}</h2>
            {spec.fields.map((field) =>
              isList(field) ? (
                <fieldset key={field.key} className="admin-posters__list">
                  <legend>{field.label[locale]}</legend>
                  {(content[field.key] as PosterItem[]).map((item, i) => (
                    <div key={i} className="admin-posters__row">
                      {field.list.map((sub) => (
                        <label key={sub.key}>
                          {sub.label[locale]}
                          <input
                            dir={sub.key === "ar" ? "rtl" : "ltr"}
                            value={item[sub.key] ?? ""}
                            onChange={(e) => {
                              const rows = [...(content[field.key] as PosterItem[])];
                              rows[i] = { ...item, [sub.key]: e.target.value };
                              set({ [field.key]: rows });
                            }}
                          />
                        </label>
                      ))}
                      <button
                        type="button"
                        className="admin-link"
                        onClick={() => set({ [field.key]: (content[field.key] as PosterItem[]).filter((_, j) => j !== i) })}
                      >
                        {p.removeRow}
                      </button>
                    </div>
                  ))}
                  {(content[field.key] as PosterItem[]).length < field.max && (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() =>
                        set({ [field.key]: [...(content[field.key] as PosterItem[]), Object.fromEntries(field.list.map((sub) => [sub.key, ""]))] })
                      }
                    >
                      {p.addRow}
                    </button>
                  )}
                </fieldset>
              ) : (
                <label key={field.key}>
                  {field.label[locale]}
                  {field.long ? (
                    <textarea
                      rows={2}
                      dir={field.key.endsWith("Ar") ? "rtl" : "ltr"}
                      value={content[field.key] as string}
                      onChange={(e) => set({ [field.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      dir={field.key.endsWith("Ar") ? "rtl" : "ltr"}
                      value={content[field.key] as string}
                      onChange={(e) => set({ [field.key]: e.target.value })}
                    />
                  )}
                </label>
              ),
            )}

            <div className="admin-form__actions">
              <button className="btn btn--primary" disabled={status === "saving" || !changed}>
                {status === "saving" ? t.common.saving : t.common.save}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => confirm(p.confirmReset) && save(posterContent(spec))}
              >
                {p.reset}
              </button>
              {changed ? <span className="admin-warn">{p.unsaved}</span> : status === "saved" && <span>✓ {t.common.saved}</span>}
            </div>
            {!["", "saving", "saved"].includes(status) && (
              <p className="admin-error" role="alert">
                {t.common.error} {status}
              </p>
            )}
          </form>

          <Preview>
            <Poster kind={kind} theme={theme} content={content} qrSvg={qrSvg} />
          </Preview>
        </div>
      </div>

      <div className="poster-print">
        {printing?.map((id) => <Poster key={id} kind={id} theme={theme} content={drafts[id]} qrSvg={qrSvg} />)}
      </div>
    </div>
  );
}

/** The A4 poster scaled down to the width available on screen. */
function Preview({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // 210 mm in CSS pixels.
    const observer = new ResizeObserver(() => setScale(el.clientWidth / ((210 * 96) / 25.4)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="poster-preview" ref={box} dir="ltr">
      <div className="poster-preview__scale" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
