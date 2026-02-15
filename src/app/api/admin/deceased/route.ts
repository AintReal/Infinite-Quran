import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthed(req: NextRequest) {
  return !!req.cookies.get("admin_token")?.value;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 20;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";

  const orderCol = sort === "most_views" ? "visits" : "id";
  const ascending = false;

  let query = supabaseAdmin
    .from("deceased")
    .select("*", { count: "exact" })
    .order(orderCol, { ascending })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) query = query.ilike("name", `%${search}%`);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count, page, perPage });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "معرف مطلوب" }, { status: 400 });

  // Only allow updating these fields
  const allowed = ["name", "companion_text", "country", "country_code", "status"] as const;
  const update: Record<string, string> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      if (key === "status" && !["approved", "rejected", "pending"].includes(fields[key])) {
        return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
      }
      update[key] = fields[key];
    }
  }

  const { error } = await supabaseAdmin.from("deceased").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "معرف مطلوب" }, { status: 400 });

  const { error } = await supabaseAdmin.from("deceased").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
