"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.55-5.17 3.55-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M16.365 1.43c0 1.14-.42 2.06-1.16 2.86-.83.9-2.02 1.6-3.17 1.5-.12-1.13.43-2.25 1.15-2.96.8-.83 2.15-1.44 3.18-1.4ZM20.5 17.02c-.53 1.22-.78 1.77-1.46 2.85-.95 1.5-2.29 3.37-3.95 3.39-1.47.02-1.85-.96-3.85-.95-2 .01-2.42.97-3.9.95-1.66-.02-2.93-1.7-3.88-3.2-2.66-4.16-2.94-9.04-1.3-11.64 1.17-1.85 3.02-2.93 4.75-2.93 1.76 0 2.87 1 4.33 1 1.41 0 2.28-1 4.33-1 1.55 0 3.19.85 4.36 2.31-3.84 2.11-3.22 7.6.57 9.22Z" />
    </svg>
  );
}

export function OAuthButtons({ refCode }: { refCode?: string | null }) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setLoading(provider);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (refCode) redirectTo.searchParams.set("ref", refCode);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={loading !== null}
        onClick={() => signInWith("google")}
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={loading !== null}
        onClick={() => signInWith("apple")}
      >
        <AppleIcon />
        Apple
      </Button>
    </div>
  );
}
