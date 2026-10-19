import Link from "next/link";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          © {new Date().getFullYear()} {t.shopName} · {t.footer} ·{" "}
          <Link href={`/${locale}/admin/`} rel="nofollow">
            {t.staffArea}
          </Link>
        </p>
      </div>
    </footer>
  );
}
