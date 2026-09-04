"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Visitor/usage analytics. PostHog's own dashboard is the "admin dashboard"
 * for visitor counts, pageviews, funnels, etc. — nothing custom to build
 * here beyond wiring the client in. No-ops silently if the key isn't set,
 * so local dev and any deploy that hasn't configured it yet stay unaffected.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <>{children}</>;
}
