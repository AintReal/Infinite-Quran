"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/control");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream/20 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="" width={50} height={50} className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-primary">لوحة التحكم</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <input
            name="username"
            required
            placeholder="اسم المستخدم"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            dir="ltr"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="كلمة المرور"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            dir="ltr"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            دخول
          </button>
        </form>
      </div>
    </main>
  );
}
