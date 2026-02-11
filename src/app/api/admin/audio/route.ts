import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthed(req: NextRequest) {
  return !!req.cookies.get("admin_token")?.value;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 30;

  const { data, count, error } = await supabaseAdmin
    .from("audio_files")
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count, page, perPage });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id, is_active } = await req.json();
  if (id === undefined || is_active === undefined) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("audio_files")
    .update({ is_active })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "معرف مطلوب" }, { status: 400 });

  const { error } = await supabaseAdmin.from("audio_files").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
