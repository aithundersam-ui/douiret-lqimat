import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const home = `/${locale}/`;
  const links = [
    { href: `${home}#about`, label: t.nav.about },
    { href: `/${locale}/menu/`, label: t.nav.menu },
    { href: `${home}#team`, label: t.nav.team },
    { href: `${home}#contact`, label: t.nav.contact },
  ];

  return (
    <header className="header">
      <div className="container header__inner">
        <Link href={home} className="header__brand" aria-label={t.shopName}>
          <Image src="/brand/logo.webp" alt="" width={48} height={48} priority />
          <span>{t.shopName}</span>
        </Link>

        <nav className="header__nav" aria-label={t.nav.home}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <LanguageSwitch locale={locale} label={t.switchLang} />
        </nav>

        {/* Mobile menu: plain <details>, no JavaScript needed. */}
        <details className="header__mobile">
          <summary aria-label={t.nav.menu}>
            <span />
            <span />
            <span />
          </summary>
          <nav>
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            <LanguageSwitch locale={locale} label={t.switchLang} />
          </nav>
        </details>
      </div>
    </header>
  );
}
