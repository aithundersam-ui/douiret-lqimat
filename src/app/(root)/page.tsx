import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دويرة اللقيمات · Douiret Lqimat",
};

// The site lives under /ar and /fr. Send visitors whose browser prefers
// French to /fr, everyone else to /ar.
const script = `location.replace(/^fr/i.test(navigator.language) ? "/fr/" : "/ar/");`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/ar/" />
      </noscript>
      <p style={{ textAlign: "center", marginTop: "4rem", fontFamily: "sans-serif" }}>
        <a href="/ar/">العربية</a> · <a href="/fr/">Français</a>
      </p>
    </>
  );
}
