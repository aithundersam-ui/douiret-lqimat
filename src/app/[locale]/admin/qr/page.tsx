"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { menuQrPng, menuQrSvg } from "@/lib/admin/menuQr";
import { defaultMenuQr, menuQrPath, menuQrUrl, type MenuQrTarget } from "@/lib/site/qr";

export default function QrPage() {
  const { store, t, role } = useAdmin();
  const q = t.qr;
  const [target, setTarget] = useState<MenuQrTarget | null>(null);
  const [svg, setSvg] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (role !== "master") return;
    store.getMenuQr().then((saved) => setTarget(saved ?? defaultMenuQr), (err) => setStatus((err as Error).message));
    menuQrSvg().then(setSvg, (err) => setStatus((err as Error).message));
  }, [store, role]);

  if (role !== "master") return <p className="admin-hint">{q.onlyMaster}</p>;
  if (!target) return status ? <p className="admin-error">{t.common.error} {status}</p> : <p>{t.common.loading}</p>;

  function download(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      await store.saveMenuQr(target!);
      setStatus("saved");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  // With "auto" the language depends on each customer's phone.
  const opens = menuQrPath(target).replace(/^\/en\//, target.lang === "auto" ? "/{en|ar|fr}/" : "/en/");

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.qr}</h1>
      </div>
      <p className="admin-hint">{q.intro}</p>

      <section className="admin-card admin-section admin-qr">
        <div className="admin-qr__code" dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <p className="admin-qr__label">{q.address}</p>
          <p dir="ltr" className="admin-qr__url">
            {menuQrUrl}
          </p>
          <div className="admin-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!svg}
              onClick={async () => download(await menuQrPng(svg), "douiret-lqimat-menu-qr.png")}
            >
              {q.downloadPng}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={!svg}
              onClick={() => download(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), "douiret-lqimat-menu-qr.svg")}
            >
              {q.downloadSvg}
            </button>
          </div>
        </div>
      </section>

      <form className="admin-card admin-section" onSubmit={save}>
        <div className="admin-pair">
          <label>
            {q.language}
            <select value={target.lang} onChange={(e) => setTarget({ ...target, lang: e.target.value as MenuQrTarget["lang"] })}>
              {(["auto", "en", "ar", "fr"] as const).map((l) => (
                <option key={l} value={l}>
                  {q.languages[l]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {q.section}
            <select value={target.section} onChange={(e) => setTarget({ ...target, section: e.target.value as MenuQrTarget["section"] })}>
              {(["", "sweets", "salty", "drinks"] as const).map((s) => (
                <option key={s} value={s}>
                  {q.sections[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="admin-hint">
          {q.opens}: <bdi dir="ltr">{opens}</bdi>
        </p>
        <div className="admin-form__actions">
          <button className="btn btn--primary" disabled={status === "saving"}>
            {status === "saving" ? t.common.saving : t.common.save}
          </button>
          <a className="btn btn--ghost" href="/qr/" target="_blank" rel="noreferrer">
            {q.test}
          </a>
          {status === "saved" && <span>✓ {t.common.saved}</span>}
        </div>
        {!["", "saving", "saved"].includes(status) && (
          <p className="admin-error" role="alert">
            {t.common.error} {status}
          </p>
        )}
      </form>
    </>
  );
}
