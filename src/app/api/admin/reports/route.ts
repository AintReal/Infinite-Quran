import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function isAuth() {
  const c = await cookies();
  return !!c.get("admin_token")?.value;
}

export async function GET(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({}, { status: 401 });

  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get("page") || "1");
  const filter = url.searchParams.get("filter") || ""; // "unread" | ""
  const perPage = 20;

  let query = supabaseAdmin
    .from("reports")
    .select("*, deceased:page_id(id, name)", { count: "exact" });

  if (filter === "unread") query = query.eq("is_read", false);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // count unread
  const { count: unreadCount } = await supabaseAdmin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  return NextResponse.json({ data: data ?? [], total: count ?? 0, unread: unreadCount ?? 0 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({}, { status: 401 });

  const { id, is_read } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("reports").update({ is_read }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({}, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("reports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
