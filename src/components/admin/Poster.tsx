/* eslint-disable @next/next/no-img-element */
"use client";

import { useLayoutEffect, useRef } from "react";
import type { PosterContent, PosterItem, PosterKind, PosterTheme } from "@/lib/admin/posters";
import { menuQrUrl } from "@/lib/site/qr";

// The pointed arch around every poster and the four-petal diamond from the logo.
function Arch() {
  return (
    <svg className="poster__arch" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden>
      <path d="M14,283 L14,80 C14,52 62,36 105,15 C148,36 196,52 196,80 L196,283 Z" fill="none" stroke="var(--frame)" strokeWidth="1.6" />
      <path d="M18.5,278.5 L18.5,81 C18.5,56 64,41 105,21 C146,41 191.5,56 191.5,81 L191.5,278.5 Z" fill="none" stroke="var(--line2)" strokeWidth="0.7" />
    </svg>
  );
}

function Diamond({ size = 14 }: { size?: number }) {
  return (
    <svg width={`${size}mm`} height={`${size}mm`} viewBox="0 0 40 40" aria-hidden>
      <path d="M20 2 C23 12 28 17 38 20 C28 23 23 28 20 38 C17 28 12 23 2 20 C12 17 17 12 20 2Z" fill="var(--diamond)" />
      <circle cx="20" cy="20" r="4.2" fill="var(--dot)" />
    </svg>
  );
}

function Divider({ width = 110 }: { width?: number }) {
  return (
    <div className="poster__divider" style={{ width: `${width}mm` }}>
      <span />
      <Diamond size={9} />
      <span />
    </div>
  );
}

function Logo({ height, top = 0 }: { height: number; top?: number }) {
  return (
    <div className="poster__logo" style={{ marginTop: `${top}mm` }}>
      <img src="/brand/logo.webp" alt="" style={{ height: `${height}mm` }} />
    </div>
  );
}

const Ar = ({ className, children, style }: { className: string; children: string; style?: React.CSSProperties }) =>
  children ? (
    <div className={`poster__ar ${className}`} dir="rtl" lang="ar" style={style}>
      {children}
    </div>
  ) : null;

const Fr = ({ className, children, style }: { className: string; children: string; style?: React.CSSProperties }) =>
  children ? (
    <div className={`poster__fr ${className}`} lang="fr" style={style}>
      {children}
    </div>
  ) : null;

/** One A4 poster (210 × 297 mm). Text that gets too long is shrunk to stay inside the arch. */
export function Poster({ kind, theme, content, qrSvg }: { kind: PosterKind; theme: PosterTheme; content: PosterContent; qrSvg: string }) {
  const fit = useRef<HTMLDivElement>(null);
  const t = (key: string) => (typeof content[key] === "string" ? (content[key] as string) : "");
  const list = (key: string) => (Array.isArray(content[key]) ? (content[key] as PosterItem[]) : []);

  useLayoutEffect(() => {
    const box = fit.current;
    const inner = box?.firstElementChild as HTMLElement | null;
    if (!box || !inner) return;
    inner.style.transform = "";
    const scale = Math.min(1, box.clientHeight / inner.scrollHeight, box.clientWidth / inner.scrollWidth);
    if (scale < 1) inner.style.transform = `scale(${scale})`;
  });

  let body: React.ReactNode;
  switch (kind) {
    case "welcome":
      body = (
        <>
          <Logo height={96} top={2} />
          <Divider width={120} />
          <Ar className="poster__huge">{t("titleAr")}</Ar>
          <Fr className="poster__big">{t("titleFr")}</Fr>
          <Fr className="poster__sub">{t("sub")}</Fr>
        </>
      );
      break;
    case "selection":
      body = (
        <>
          <Logo height={38} />
          <Ar className="poster__title">{t("titleAr")}</Ar>
          <Fr className="poster__title-fr">{t("titleFr")}</Fr>
          <Divider width={90} />
          <div className="poster__tiles">
            {list("tiles").map((tile, i) => (
              <div key={i} className="poster__tile">
                <Diamond size={10} />
                <Ar className="poster__tile-ar">{tile.ar}</Ar>
                <Fr className="poster__tile-fr">{tile.fr}</Fr>
                <Fr className="poster__tile-note">{tile.note}</Fr>
              </div>
            ))}
          </div>
          {(t("footerFr") || t("footerAr")) && (
            <div className="poster__fr poster__sub" style={{ marginTop: "4mm" }}>
              {t("footerFr")}
              {t("footerFr") && t("footerAr") && " · "}
              <span className="poster__ar-inline" lang="ar">
                {t("footerAr")}
              </span>
            </div>
          )}
        </>
      );
      break;
    case "orders":
      body = (
        <>
          <Logo height={30} />
          <Ar className="poster__title" style={{ fontSize: "16mm" }}>
            {t("titleAr")}
          </Ar>
          <Fr className="poster__title-fr">{t("titleFr")}</Fr>
          <Divider width={90} />
          <ul className="poster__occasions">
            {list("items").map((item, i) => (
              <li key={i}>
                <span className="poster__fr" lang="fr">
                  {item.fr}
                </span>
                <Diamond size={6} />
                <span className="poster__ar" lang="ar" dir="rtl">
                  {item.ar}
                </span>
              </li>
            ))}
          </ul>
          {(t("askAr") || t("askFr")) && (
            <div className="poster__ask">
              <span className="poster__ar" lang="ar">
                {t("askAr")}
              </span>
              {t("askAr") && t("askFr") && " · "}
              <span className="poster__fr" lang="fr">
                {t("askFr")}
              </span>
            </div>
          )}
          <div className="poster__phone">
            <span className="poster__fr">Tél.</span>
            <span className="poster__fill" dir="ltr">
              {t("phone")}
            </span>
            <span className="poster__ar" lang="ar">
              الهاتف
            </span>
          </div>
        </>
      );
      break;
    case "hours":
      body = (
        <>
          <Logo height={36} />
          <Ar className="poster__title">{t("titleAr")}</Ar>
          <Fr className="poster__title-fr">{t("titleFr")}</Fr>
          <Divider width={90} />
          <table className="poster__hours">
            <tbody>
              {list("days").map((day, i) => (
                <tr key={i}>
                  <td className="poster__fr poster__day-fr">{day.fr}</td>
                  <td className="poster__time" dir="ltr">
                    {day.time}
                  </td>
                  <td className="poster__ar poster__day-ar" lang="ar">
                    {day.ar}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
      break;
    case "open":
    case "closed":
      body = (
        <>
          <Logo height={58} />
          <div className={`poster__sign${kind === "closed" ? " poster__sign--closed" : ""}`}>
            <Ar className="poster__sign-ar">{t("signAr")}</Ar>
            <Fr className="poster__sign-fr">{t("signFr")}</Fr>
          </div>
          <Ar className="poster__sub-ar" style={{ marginTop: "12mm" }}>
            {t("subAr")}
          </Ar>
          <Fr className="poster__sub">{t("subFr")}</Fr>
        </>
      );
      break;
    case "noTouch":
      body = (
        <>
          <Logo height={44} />
          <div style={{ marginTop: "6mm" }}>
            <Diamond size={16} />
          </div>
          <Ar className="poster__title poster__title--wrap" style={{ fontSize: "17mm" }}>
            {t("titleAr")}
          </Ar>
          <Fr className="poster__title-fr" style={{ fontSize: "9mm" }}>
            {t("titleFr")}
          </Fr>
          <Divider width={90} />
          <Ar className="poster__sub-ar">{t("subAr")}</Ar>
          <Fr className="poster__sub">{t("subFr")}</Fr>
        </>
      );
      break;
    case "thanks":
      body = (
        <>
          <Logo height={84} top={2} />
          <Divider width={120} />
          <Ar className="poster__huge" style={{ fontSize: "19mm" }}>
            {t("titleAr")}
          </Ar>
          <Fr className="poster__big">{t("titleFr")}</Fr>
          <Ar className="poster__sub-ar" style={{ marginTop: "6mm" }}>
            {t("subAr")}
          </Ar>
          <Fr className="poster__sub">{t("subFr")}</Fr>
        </>
      );
      break;
    case "menuQr":
      body = (
        <>
          <Logo height={34} />
          <Ar className="poster__title" style={{ fontSize: "16mm" }}>
            {t("titleAr")}
          </Ar>
          <Fr className="poster__title-fr">{t("titleFr")}</Fr>
          <div className="poster__qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <Ar className="poster__sub-ar" style={{ fontSize: "8.5mm" }}>
            {t("subAr")}
          </Ar>
          <Fr className="poster__sub" style={{ marginTop: 0 }}>
            {t("subFr")}
          </Fr>
          <div className="poster__url">{menuQrUrl.replace("https://", "")}</div>
        </>
      );
      break;
  }

  return (
    <section className={`poster poster--${theme}`} dir="ltr">
      <Arch />
      <div className="poster__content" ref={fit}>
        <div className="poster__inner">{body}</div>
      </div>
    </section>
  );
}
