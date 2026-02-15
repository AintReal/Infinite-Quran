"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Headphones, Eye, ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { t, isRtl, type Locale } from "@/lib/i18n";

const countryFlags: Record<string, string> = {
  "السعودية": "🇸🇦", "Saudi Arabia": "🇸🇦", "Arab Saudi": "🇸🇦", "Arabie Saoudite": "🇸🇦",
  "الإمارات": "🇦🇪", "UAE": "🇦🇪", "UEA": "🇦🇪", "EAU": "🇦🇪",
  "الكويت": "🇰🇼", "Kuwait": "🇰🇼", "Koweït": "🇰🇼",
  "البحرين": "🇧🇭", "Bahrain": "🇧🇭", "Bahreïn": "🇧🇭",
  "قطر": "🇶🇦", "Qatar": "🇶🇦", "عمان": "🇴🇲", "Oman": "🇴🇲",
  "مصر": "🇪🇬", "Egypt": "🇪🇬", "Mesir": "🇪🇬", "Égypte": "🇪🇬",
  "الأردن": "🇯🇴", "Jordan": "🇯🇴", "العراق": "🇮🇶", "Iraq": "🇮🇶",
  "فلسطين": "🇵🇸", "Palestine": "🇵🇸", "لبنان": "🇱🇧", "Lebanon": "🇱🇧",
  "سوريا": "🇸🇾", "Syria": "🇸🇾", "اليمن": "🇾🇪", "Yemen": "🇾🇪",
  "ليبيا": "🇱🇾", "Libya": "🇱🇾", "تونس": "🇹🇳", "Tunisia": "🇹🇳",
  "الجزائر": "🇩🇿", "Algeria": "🇩🇿", "المغرب": "🇲🇦", "Morocco": "🇲🇦",
  "السودان": "🇸🇩", "Sudan": "🇸🇩", "تركيا": "🇹🇷", "Turkey": "🇹🇷",
  "ماليزيا": "🇲🇾", "Malaysia": "🇲🇾", "إندونيسيا": "🇮🇩", "Indonesia": "🇮🇩",
  "باكستان": "🇵🇰", "Pakistan": "🇵🇰", "الهند": "🇮🇳", "India": "🇮🇳",
  "فرنسا": "🇫🇷", "France": "🇫🇷", "بريطانيا": "🇬🇧", "UK": "🇬🇧",
  "أمريكا": "🇺🇸", "USA": "🇺🇸", "كندا": "🇨🇦", "Canada": "🇨🇦",
  "ألمانيا": "🇩🇪", "Germany": "🇩🇪",
};

type Person = { id: number; name: string; country: string; visits: number; created_at: string; companion_text: string };

export default function BrowsePage() {
  const { lang } = useParams<{ lang: string }>();
  const locale = lang as Locale;
  const d = t(locale);
  const rtl = isRtl(locale);
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const [data, setData] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), sort });
    if (search) params.set("search", search);
    const res = await fetch(`/api/browse?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, search, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / 20);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : locale === "id" ? "id-ID" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-cream/10">
      <header className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`}>
              <Image src="/logo.png" alt={d.siteTitle} width={40} height={40} />
            </Link>
            <h1 className="text-lg font-bold text-primary">{d.browseTitle}</h1>
          </div>
          <Link
            href={`/${locale}/register`}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/80"
          >
            {d.registerNow}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={d.searchPlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">{locale === "ar" ? "الأحدث" : locale === "fr" ? "Plus récent" : locale === "id" ? "Terbaru" : "Newest"}</option>
            <option value="most_views">{locale === "ar" ? "الأكثر زيارة" : locale === "fr" ? "Plus visité" : locale === "id" ? "Terpopuler" : "Most Visited"}</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-gray-400">{total.toLocaleString("en-US")} {d.statsRegistered}</p>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-gray-400">{d.noResults}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((person) => (
              <Link
                key={person.id}
                href={`/${locale}/${person.id}`}
                className="group flex flex-col gap-2 rounded-2xl border border-cream bg-white p-4 transition hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{person.name}</span>
                      <p className="text-xs text-gray-400">{person.companion_text}</p>
                    </div>
                  </div>
                  <Arrow size={16} className="text-primary opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-cream/60 pt-2 mt-1">
                  {person.country && (
                    <span className="flex items-center gap-1">
                      {countryFlags[person.country] ? <span>{countryFlags[person.country]}</span> : <Globe size={12} />}
                      {person.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {person.visits.toLocaleString("en-US")} {d.visits}
                  </span>
                  <span className="mr-auto">{formatDate(person.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-30 transition hover:bg-cream/30"
            >
              {locale === "ar" ? "السابق" : "Previous"}
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-30 transition hover:bg-cream/30"
            >
              {locale === "ar" ? "التالي" : "Next"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
