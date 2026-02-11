"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

/* reCAPTCHA v3 — paused for now
declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}
*/

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const locale = lang as Locale;
  const d = t(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* reCAPTCHA v3 — paused for now
  const getRecaptchaToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) return resolve("");
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: "register" })
          .then(resolve)
          .catch(() => resolve(""));
      });
    });
  }, []);
  */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name"),
      companion_text: form.get("companion_text"),
      country: form.get("country"),
      created_by_name: form.get("created_by_name"),
      created_by_email: form.get("created_by_email"),
      created_by_phone: form.get("created_by_phone"),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || d.genericError);
        setLoading(false);
        return;
      }
      router.push(`/${locale}/${data.id}`);
    } catch {
      setError(d.connectionError);
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream/20 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href={`/${locale}`}>
            <Image src="/logo.png" alt={d.siteTitle} width={60} height={60} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-primary">{d.registerTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{d.registerSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.deceasedName} *</label>
            <input name="name" required maxLength={255} className={inputClass} placeholder={d.namePlaceholder} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.prayerText}</label>
            <select name="companion_text" className={inputClass} defaultValue={d.companionOptions[0]}>
              {d.companionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.country}</label>
            <select name="country" className={inputClass} defaultValue={d.countries[0]}>
              {d.countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.yourName}</label>
            <input name="created_by_name" maxLength={255} className={inputClass} placeholder={d.fullNamePlaceholder} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.email}</label>
            <input name="created_by_email" type="email" className={inputClass} placeholder="example@email.com" dir="ltr" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{d.phone}</label>
            <input name="created_by_phone" type="tel" className={inputClass} placeholder="+966..." dir="ltr" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? d.submitting : d.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
