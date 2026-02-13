import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";

const MAX_PER_WINDOW = 10;
const WINDOW_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, companion_text, country, created_by_name, created_by_email, created_by_phone } = body;

    if (!name) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }

    /* reCAPTCHA v3 — paused for now
    if (recaptchaToken) {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      });
      const verify = await verifyRes.json();
      const threshold = parseFloat(process.env.RECAPTCHA_THRESHOLD || "0.5");
      if (!verify.success || verify.score < threshold) {
        return NextResponse.json({ error: "فشل التحقق" }, { status: 403 });
      }
    }
    */

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { data: limit } = await supabaseAdmin
      .from("rate_limits")
      .select("*")
      .eq("ip_address", ip)
      .eq("action_type", "registration")
      .single();

    if (limit) {
      const firstAttempt = new Date(limit.first_attempt).getTime();
      const now = Date.now();

      if (now - firstAttempt > WINDOW_MS) {
        await supabaseAdmin
          .from("rate_limits")
          .update({ attempt_count: 0, first_attempt: new Date().toISOString(), last_attempt: new Date().toISOString() })
          .eq("ip_address", ip)
          .eq("action_type", "registration");
      } else if (limit.attempt_count >= MAX_PER_WINDOW) {
        return NextResponse.json({ error: "تم تجاوز الحد المسموح، حاول بعد 30 دقيقة" }, { status: 429 });
      }
    }

    const { data: nextIdData } = await supabaseAdmin.rpc("get_next_deceased_id");
    const nextId = nextIdData as number;

    const { error } = await supabaseAdmin.from("deceased").insert({
      id: nextId,
      name,
      companion_text: companion_text || "رحمه الله تعالى",
      country: country || "السعودية",
      language: "ar",
      created_by_name,
      created_by_email: created_by_email || null,
      created_by_phone: created_by_phone || null,
      status: "approved",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const currentCount = (limit && new Date(limit.first_attempt).getTime() > Date.now() - WINDOW_MS)
      ? limit.attempt_count
      : 0;

    await supabaseAdmin.from("rate_limits").upsert(
      {
        ip_address: ip,
        action_type: "registration",
        attempt_count: currentCount + 1,
        first_attempt: currentCount === 0 ? new Date().toISOString() : (limit?.first_attempt || new Date().toISOString()),
        last_attempt: new Date().toISOString(),
      },
      { onConflict: "ip_address,action_type" }
    );

    return NextResponse.json({ id: nextId });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
