import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, visitorId } = await req.json();
    if (!path || !visitorId) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const userAgent = req.headers.get("user-agent") ?? undefined;

    await supabase.from("page_views").insert({
      path,
      referrer: referrer || null,
      visitor_id: visitorId,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "tracking failed" }, { status: 500 });
  }
}
