"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LastViewedTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const slug = pathname.split("/").filter(Boolean)[0];

    if (!slug) return;

    const storageKey = "gsap-last-viewed";
    const lastViewed = JSON.parse(localStorage.getItem(storageKey) || "{}");

    lastViewed[slug] = new Date().toISOString();

    localStorage.setItem(storageKey, JSON.stringify(lastViewed));
  }, [pathname]);

  return null;
}
