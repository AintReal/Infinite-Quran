import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { page_id, name, contact, message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });

    const { error } = await supabaseAdmin.from("reports").insert({
      page_id: page_id || null,
      name: name?.trim() || null,
      contact: contact?.trim() || null,
      message: message.trim(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
