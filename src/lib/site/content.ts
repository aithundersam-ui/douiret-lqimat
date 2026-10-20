import { products as defaultProducts, type Product as MenuProduct } from "@/data/menu";
import { shop } from "@/data/shop";
import { team as defaultTeam, type TeamMember } from "@/data/team";
import { getDictionary } from "@/lib/dictionary";
import { locales, type Localized } from "@/lib/i18n";

/** Everything on the home page that the owner can edit from the staff area. */
export type HomeContent = {
  tagline: Localized;
  heroTitle: Localized;
  heroText: Localized;
  aboutTitle: Localized;
  about: { icon: string; title: Localized; text: Localized }[];
  menuSubtitle: Localized;
  teamSubtitle: Localized;
  preorderNote: Localized;
  phone: string;
  whatsapp: string;
  address: Localized;
  mapUrl: string;
  hours: { days: Localized; time: string }[];
  instagram: string;
  facebook: string;
};

export type SiteData = { content: HomeContent; products: MenuProduct[]; team: TeamMember[] };

const en = getDictionary("en");
const ar = getDictionary("ar");
const fr = getDictionary("fr");
const all = (pick: (t: typeof ar) => string): Localized => ({ en: pick(en), ar: pick(ar), fr: pick(fr) });
const icons = ["🍯", "🧁", "🥟", "🎉"];

export const defaultContent: HomeContent = {
  tagline: all((t) => t.tagline),
  heroTitle: all((t) => t.hero.title),
  heroText: all((t) => t.hero.text),
  aboutTitle: all((t) => t.about.title),
  about: en.about.items.map((item, i) => ({
    icon: icons[i] ?? "⭐",
    title: { en: item.title, ar: ar.about.items[i].title, fr: fr.about.items[i].title },
    text: { en: item.text, ar: ar.about.items[i].text, fr: fr.about.items[i].text },
  })),
  menuSubtitle: all((t) => t.menu.subtitle),
  teamSubtitle: all((t) => t.team.subtitle),
  preorderNote: all((t) => t.contact.preorder),
  phone: shop.phone,
  whatsapp: shop.whatsapp,
  address: shop.address,
  mapUrl: shop.mapUrl,
  hours: shop.hours,
  instagram: shop.social.instagram,
  facebook: shop.social.facebook,
};

export const defaultSiteData: SiteData = { content: defaultContent, products: defaultProducts, team: defaultTeam };

/** Text saved before English was added has only ar and fr: make sure every language key exists. */
function fillLanguages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fillLanguages);
  if (!value || typeof value !== "object") return value;
  const obj = value as Record<string, unknown>;
  if ("ar" in obj && "fr" in obj && typeof obj.ar === "string") {
    const text = Object.fromEntries(locales.map((l) => [l, typeof obj[l] === "string" ? obj[l] : ""]));
    return text;
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fillLanguages(v)]));
}

/** Saved content may be partial or from an older version: fill the gaps from the defaults. */
export function withDefaults(saved: Partial<HomeContent> | null | undefined): HomeContent {
  if (!saved || typeof saved !== "object") return defaultContent;
  const out = { ...defaultContent } as Record<string, unknown>;
  for (const [k, v] of Object.entries(saved)) if (k in defaultContent && v != null) out[k] = fillLanguages(v);
  return out as HomeContent;
}

/** Rows as stored in the database, turned into what the public pages show. */
export type ProductRow = {
  id: string;
  name_en?: string;
  name_ar: string;
  name_fr: string;
  description_en?: string;
  description_ar?: string;
  description_fr?: string;
  category: MenuProduct["category"];
  unit: MenuProduct["unit"];
  price: number;
  featured?: boolean;
  image_url?: string;
  active: boolean;
};

export type TeamRow = {
  id: string;
  name_en?: string;
  name_ar: string;
  name_fr: string;
  role_en?: string;
  role_ar: string;
  role_fr: string;
  photo_url: string;
  sort: number;
};

export function toMenuProduct(p: ProductRow): MenuProduct {
  const description =
    p.description_en || p.description_ar || p.description_fr
      ? { en: p.description_en ?? "", ar: p.description_ar ?? "", fr: p.description_fr ?? "" }
      : undefined;
  return {
    id: p.id,
    name: { en: p.name_en ?? "", ar: p.name_ar, fr: p.name_fr },
    description,
    category: p.category,
    price: Number(p.price),
    unit: p.unit,
    image: p.image_url || undefined,
    featured: Boolean(p.featured),
  };
}

export function toTeamMember(m: TeamRow): TeamMember {
  return {
    name: { en: m.name_en ?? "", ar: m.name_ar, fr: m.name_fr },
    role: { en: m.role_en ?? "", ar: m.role_ar, fr: m.role_fr },
    photo: m.photo_url || undefined,
  };
}

/** Combine whatever was loaded with the defaults: empty lists fall back to the sample menu and team. */
export function buildSiteData(parts: { content?: Partial<HomeContent> | null; products?: ProductRow[]; team?: TeamRow[] }): SiteData {
  const products = (parts.products ?? []).filter((p) => p.active).map(toMenuProduct);
  const team = [...(parts.team ?? [])].sort((a, b) => a.sort - b.sort).map(toTeamMember);
  return {
    content: withDefaults(parts.content),
    products: products.length ? products : defaultProducts,
    team: team.length ? team : defaultTeam,
  };
}
