import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthed(req: NextRequest) {
  return !!req.cookies.get("admin_token")?.value;
}

const DAY = 86400000;

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "30";
  const days = period === "all" ? 0 : parseInt(period, 10) || 30;

  const now = new Date();
  const since = days > 0 ? new Date(now.getTime() - (days - 1) * DAY).toISOString().split("T")[0] : null;

  // 5: pages created in period
  const pagesQ = supabaseAdmin.from("deceased").select("*", { count: "exact", head: true });
  if (since) pagesQ.gte("created_at", since);

  const [totalRes, visitsRes, pendingRes, approvedRes, rejectedRes, periodRes] = await Promise.all([
    supabaseAdmin.from("deceased").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("deceased").select("visits"),
    supabaseAdmin.from("deceased").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("deceased").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabaseAdmin.from("deceased").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    pagesQ,
  ]);

  const totalPages = totalRes.count ?? 0;
  const legacyVisits = parseInt(process.env.LEGACY_VISITS || "0", 10);
  const totalVisits = (visitsRes.data ?? []).reduce((s: number, r: { visits: number }) => s + (r.visits || 0), 0) + legacyVisits;
  const periodPages = periodRes.count ?? 0;

  // Build chart data
  let chartData: { date: string; count: number }[];

  if (days === 1) {
    // Hourly breakdown for "today"
    const today = now.toISOString().split("T")[0];
    const hourCounts = await Promise.all(
      Array.from({ length: 24 }, (_, h) => {
        const from = `${today}T${String(h).padStart(2, "0")}:00:00`;
        const to = `${today}T${String(h).padStart(2, "0")}:59:59`;
        return supabaseAdmin
          .from("deceased")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lte("created_at", to);
      })
    );
    chartData = Array.from({ length: 24 }, (_, h) => ({
      date: `${String(h).padStart(2, "0")}:00`,
      count: hourCounts[h].count ?? 0,
    }));
  } else {
    // Daily breakdown
    const chartDays = days > 0 ? days : 365;
    const dayDates: string[] = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      dayDates.push(new Date(now.getTime() - i * DAY).toISOString().split("T")[0]);
    }
    const chartCounts = await Promise.all(
      dayDates.map((date) => {
        const nextDate = new Date(new Date(date).getTime() + DAY).toISOString().split("T")[0];
        return supabaseAdmin
          .from("deceased")
          .select("*", { count: "exact", head: true })
          .gte("created_at", date)
          .lt("created_at", nextDate);
      })
    );
    chartData = dayDates.map((date, i) => ({
      date,
      count: chartCounts[i].count ?? 0,
    }));
  }

  return NextResponse.json({
    totalPages,
    totalVisits,
    periodPages,
    status: {
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
    },
    chartData,
  });
}
