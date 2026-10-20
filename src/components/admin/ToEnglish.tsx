"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** The staff area is in English and Arabic only: /fr/admin/… opens the English version. */
export function ToEnglish() {
  const pathname = usePathname() ?? "/fr/admin/";
  const target = pathname.replace(/^\/fr(?=\/|$)/, "/en");
  useEffect(() => location.replace(target), [target]);
  return (
    <p className="admin-loading">
      <a href={target}>English</a> · <a href={target.replace(/^\/en/, "/ar")}>العربية</a>
    </p>
  );
}
