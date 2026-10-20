"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SiteData } from "@/lib/site/content";
import { loadSiteData } from "@/lib/site/load";

const SiteDataContext = createContext<SiteData | null>(null);

/**
 * Provides the website content to the public pages. Starts with what was
 * loaded at build time, then refreshes in the browser so edits made in the
 * staff area appear straight away.
 */
export function SiteDataProvider({ initial, children }: { initial: SiteData; children: React.ReactNode }) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    loadSiteData().then((fresh) => fresh && setData(fresh));
  }, []);
  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const data = useContext(SiteDataContext);
  if (!data) throw new Error("useSiteData must be used inside SiteDataProvider");
  return data;
}
