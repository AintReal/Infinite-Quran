import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (!user) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 401 });
    }

    await supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id);

    const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString("base64");

    const res = NextResponse.json({ ok: true, username: user.username });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
