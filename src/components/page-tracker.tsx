"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getVisitorId(): string {
  const KEY = "personaai_vid";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef("");

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const visitorId = getVisitorId();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        visitorId,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
