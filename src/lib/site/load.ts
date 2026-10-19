import { buildSiteData, type HomeContent, type ProductRow, type SiteData, type TeamRow } from "./content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Next.js may keep build-time fetches in its cache between builds; a per-build
// header (part of the cache key) makes every build read the latest content.
const buildMarker = Date.now();

/**
 * Load the website content saved from the staff area. Runs at build time (so
 * the static pages carry the latest content) and again in the browser (so
 * edits show up without waiting for a rebuild). Returns null when nothing can
 * be loaded; the pages then keep what they have.
 */
export async function loadSiteData(): Promise<SiteData | null> {
  if (url && key) return loadFromSupabase(url, key);
  if (typeof window !== "undefined") {
    const { readDemoSiteParts } = await import("@/lib/admin/demoStore");
    const parts = readDemoSiteParts();
    return parts ? buildSiteData(parts) : null;
  }
  return null;
}

async function loadFromSupabase(url: string, key: string): Promise<SiteData | null> {
  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        // Server only: an unknown header would make the browser's CORS check fail.
        ...(typeof window === "undefined" ? { "x-build": String(buildMarker) } : {}),
      },
      signal: AbortSignal.timeout(8000),
      // At build time the static export needs a cacheable fetch; in the browser always get the latest.
      cache: typeof window === "undefined" ? "force-cache" : "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return res.json();
  };
  try {
    const [content, products, team] = await Promise.all([
      get<{ value: Partial<HomeContent> }[]>("site_content?key=eq.home&select=value"),
      get<ProductRow[]>("products?active=eq.true&select=*&order=created_at.asc"),
      get<TeamRow[]>("team_members?select=*&order=sort.asc"),
    ]);
    return buildSiteData({ content: content[0]?.value, products, team });
  } catch (err) {
    console.warn("Could not load website content, keeping the current version:", (err as Error).message);
    return null;
  }
}
