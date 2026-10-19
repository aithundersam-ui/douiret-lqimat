import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Footer({ t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          © {new Date().getFullYear()} {t.shopName} · {t.footer}
        </p>
      </div>
    </footer>
  );
}
