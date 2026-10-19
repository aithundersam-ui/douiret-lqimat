import { products as defaultProducts, type Product as MenuProduct } from "@/data/menu";
import { shop } from "@/data/shop";
import { team as defaultTeam, type TeamMember } from "@/data/team";
import { getDictionary } from "@/lib/dictionary";
import type { Localized } from "@/lib/i18n";

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

const ar = getDictionary("ar");
const fr = getDictionary("fr");
const both = (pick: (t: typeof ar) => string): Localized => ({ ar: pick(ar), fr: pick(fr) });
const icons = ["🍯", "🧁", "🥟", "🎉"];

export const defaultContent: HomeContent = {
  tagline: both((t) => t.tagline),
  heroTitle: both((t) => t.hero.title),
  heroText: both((t) => t.hero.text),
  aboutTitle: both((t) => t.about.title),
  about: ar.about.items.map((item, i) => ({
    icon: icons[i] ?? "⭐",
    title: { ar: item.title, fr: fr.about.items[i].title },
    text: { ar: item.text, fr: fr.about.items[i].text },
  })),
  menuSubtitle: both((t) => t.menu.subtitle),
  teamSubtitle: both((t) => t.team.subtitle),
  preorderNote: both((t) => t.contact.preorder),
  phone: shop.phone,
  whatsapp: shop.whatsapp,
  address: shop.address,
  mapUrl: shop.mapUrl,
  hours: shop.hours,
  instagram: shop.social.instagram,
  facebook: shop.social.facebook,
};

export const defaultSiteData: SiteData = { content: defaultContent, products: defaultProducts, team: defaultTeam };

/** Saved content may be partial or from an older version: fill the gaps from the defaults. */
export function withDefaults(saved: Partial<HomeContent> | null | undefined): HomeContent {
  if (!saved || typeof saved !== "object") return defaultContent;
  const out = { ...defaultContent } as Record<string, unknown>;
  for (const [k, v] of Object.entries(saved)) if (k in defaultContent && v != null) out[k] = v;
  return out as HomeContent;
}

/** Rows as stored in the database, turned into what the public pages show. */
export type ProductRow = {
  id: string;
  name_ar: string;
  name_fr: string;
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
  name_ar: string;
  name_fr: string;
  role_ar: string;
  role_fr: string;
  photo_url: string;
  sort: number;
};

export function toMenuProduct(p: ProductRow): MenuProduct {
  const description = p.description_ar || p.description_fr ? { ar: p.description_ar ?? "", fr: p.description_fr || p.description_ar || "" } : undefined;
  return {
    id: p.id,
    name: { ar: p.name_ar, fr: p.name_fr || p.name_ar },
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
    name: { ar: m.name_ar, fr: m.name_fr || m.name_ar },
    role: { ar: m.role_ar, fr: m.role_fr || m.role_ar },
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
