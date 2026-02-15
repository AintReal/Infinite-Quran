import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 20;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";

  const orderCol = sort === "most_views" ? "visits" : "created_at";

  let query = supabase
    .from("deceased")
    .select("id, name, country, visits, created_at, companion_text", { count: "exact" })
    .eq("status", "approved")
    .order(orderCol, { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count, page, perPage });
}
