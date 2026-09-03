"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PENDING_CREATION_KEY } from "@/lib/pending-creation";

/**
 * A visitor can pick a story/style on the homepage before signing up; signup
 * always lands them on /dashboard first. If there's a pending creation
 * waiting, send them straight to /dashboard/create instead of making them
 * navigate there themselves and re-enter what they just typed.
 */
export function PendingCreationRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/dashboard/create") return;
    if (sessionStorage.getItem(PENDING_CREATION_KEY)) {
      router.replace("/dashboard/create");
    }
  }, [pathname, router]);

  return null;
}
