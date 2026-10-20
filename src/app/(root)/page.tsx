import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Douiret Lqimat · دويرة اللقيمات",
};

// The site lives under /en, /ar and /fr. Visitors whose browser prefers Arabic
// or French go to that version, everyone else to English.
const script = `var l = navigator.language || ""; location.replace(/^ar/i.test(l) ? "/ar/" : /^fr/i.test(l) ? "/fr/" : "/en/");`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/en/" />
      </noscript>
      <p style={{ textAlign: "center", marginTop: "4rem", fontFamily: "sans-serif" }}>
        <a href="/en/">English</a> · <a href="/ar/">العربية</a> · <a href="/fr/">Français</a>
      </p>
    </>
  );
}
