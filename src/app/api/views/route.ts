import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ua = headersList.get("user-agent") || null;

    await supabaseAdmin.rpc("increment_visits", { row_id: id });

    await supabaseAdmin.from("visit_logs").upsert(
      { deceased_id: id, visitor_ip: ip, visit_date: new Date().toISOString().split("T")[0], user_agent: ua },
      { onConflict: "deceased_id,visitor_ip,visit_date" }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
