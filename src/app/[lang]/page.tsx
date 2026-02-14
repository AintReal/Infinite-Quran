import Image from "next/image";
import Link from "next/link";
import { Users, Radio, Globe, Clock, Headphones, ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { t, isRtl, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";

export const revalidate = 60;

async function getStats() {
  const { data } = await supabase.from("stats_overview").select("*").single();
  return data ?? { total_approved: 0, total_pending: 0, total_visits: 0, total_countries: 0, today_registrations: 0 };
}

async function getRecent() {
  const { data } = await supabase
    .from("deceased")
    .select("id, name, country, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getMostListened() {
  const { data } = await supabase
    .from("deceased")
    .select("id, name, visits")
    .eq("status", "approved")
    .gt("visits", 0)
    .order("visits", { ascending: false })
    .limit(6);
  return data ?? [];
}

const countryFlags: Record<string, string> = {
  "السعودية": "🇸🇦", "Saudi Arabia": "🇸🇦", "Arab Saudi": "🇸🇦", "Arabie Saoudite": "🇸🇦",
  "الإمارات": "🇦🇪", "UAE": "🇦🇪", "UEA": "🇦🇪", "EAU": "🇦🇪",
  "الكويت": "🇰🇼", "Kuwait": "🇰🇼", "Koweït": "🇰🇼",
  "البحرين": "🇧🇭", "Bahrain": "🇧🇭", "Bahreïn": "🇧🇭",
  "قطر": "🇶🇦", "Qatar": "🇶🇦",
  "عمان": "🇴🇲", "Oman": "🇴🇲",
  "مصر": "🇪🇬", "Egypt": "🇪🇬", "Mesir": "🇪🇬", "Égypte": "🇪🇬",
  "الأردن": "🇯🇴", "Jordan": "🇯🇴", "Yordania": "🇯🇴", "Jordanie": "🇯🇴",
  "العراق": "🇮🇶", "Iraq": "🇮🇶", "Irak": "🇮🇶",
  "فلسطين": "🇵🇸", "Palestine": "🇵🇸", "Palestina": "🇵🇸",
  "لبنان": "🇱🇧", "Lebanon": "🇱🇧", "Liban": "🇱🇧",
  "سوريا": "🇸🇾", "Syria": "🇸🇾", "Suriah": "🇸🇾", "Syrie": "🇸🇾",
  "اليمن": "🇾🇪", "Yemen": "🇾🇪", "Yaman": "🇾🇪", "Yémen": "🇾🇪",
  "ليبيا": "🇱🇾", "Libya": "🇱🇾", "Libye": "🇱🇾",
  "تونس": "🇹🇳", "Tunisia": "🇹🇳", "Tunisie": "🇹🇳",
  "الجزائر": "🇩🇿", "Algeria": "🇩🇿", "Aljazair": "🇩🇿", "Algérie": "🇩🇿",
  "المغرب": "🇲🇦", "Morocco": "🇲🇦", "Maroko": "🇲🇦", "Maroc": "🇲🇦",
  "السودان": "🇸🇩", "Sudan": "🇸🇩", "Soudan": "🇸🇩",
  "الصومال": "🇸🇴", "Somalia": "🇸🇴", "Somalie": "🇸🇴",
  "جيبوتي": "🇩🇯", "Djibouti": "🇩🇯",
  "موريتانيا": "🇲🇷", "Mauritania": "🇲🇷", "Mauritanie": "🇲🇷",
  "تركيا": "🇹🇷", "Turkey": "🇹🇷", "Turki": "🇹🇷", "Turquie": "🇹🇷",
  "ماليزيا": "🇲🇾", "Malaysia": "🇲🇾", "Malaisie": "🇲🇾",
  "إندونيسيا": "🇮🇩", "Indonesia": "🇮🇩", "Indonésie": "🇮🇩",
  "باكستان": "🇵🇰", "Pakistan": "🇵🇰",
  "الهند": "🇮🇳", "India": "🇮🇳", "Inde": "🇮🇳",
  "فرنسا": "🇫🇷", "France": "🇫🇷", "Prancis": "🇫🇷",
  "بريطانيا": "🇬🇧", "UK": "🇬🇧", "Inggris": "🇬🇧", "Royaume-Uni": "🇬🇧",
  "أمريكا": "🇺🇸", "USA": "🇺🇸", "Amerika": "🇺🇸", "États-Unis": "🇺🇸",
  "كندا": "🇨🇦", "Canada": "🇨🇦", "Kanada": "🇨🇦",
  "ألمانيا": "🇩🇪", "Germany": "🇩🇪", "Jerman": "🇩🇪", "Allemagne": "🇩🇪",
};

type Props = { params: Promise<{ lang: string }> };

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const locale = lang as Locale;
  const d = t(locale);
  const rtl = isRtl(locale);
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const [stats, recent, mostListened] = await Promise.all([getStats(), getRecent(), getMostListened()]);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden text-white">
        <Image src="/hrm.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <div className="absolute top-4 left-4 z-20">
          <LangSwitcher current={locale} />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <Image src="/logo.png" alt={d.siteTitle} width={140} height={140} className="brightness-0 invert" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center mt-16 pb-56 md:pb-36">
          <h1 className="text-2xl font-bold leading-relaxed md:text-4xl max-w-3xl">
            {d.heroLine1}
          </h1>
          <p className="text-lg md:text-2xl text-cream/80 font-medium">{d.heroLine2}</p>

          <p dir="rtl" className="text-sm md:text-base text-white/50 mt-2 max-w-2xl">
            ﴿ إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ﴾
          </p>
          <p className="text-xs text-cream/40">{d.surahYasRef}</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Link
              href={`/${locale}/register`}
              className="rounded-xl bg-cream px-8 py-3 text-base font-bold text-primary shadow-lg transition hover:opacity-80"
            >
              {d.registerNow}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 z-10">
          <div className="mx-auto max-w-4xl px-4 pb-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: Users, label: d.statsRegistered, value: stats.total_approved.toLocaleString("en-US") },
                { icon: Radio, label: d.statsListeners, value: stats.total_visits.toLocaleString("en-US") },
                { icon: Globe, label: d.statsCountries, value: stats.total_countries.toLocaleString("en-US") },
                { icon: Clock, label: d.statsAllDay, value: "24/7" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-4 backdrop-blur-md border border-white/10">
                  <s.icon size={18} className="text-cream" />
                  <span className="text-xl font-bold">{s.value}</span>
                  <span className="text-[11px] text-cream/70">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream/20 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-primary mb-10">{d.howItWorks}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: d.step1Title, desc: d.step1Desc },
              { step: "2", title: d.step2Title, desc: d.step2Desc },
              { step: "3", title: d.step3Title, desc: d.step3Desc },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-primary">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-primary">{d.recentRegistrations}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {recent.map((person) => (
            <Link
              key={person.id}
              href={`/${locale}/${person.id}`}
              className="group flex items-center justify-between rounded-2xl border border-cream bg-white p-4 transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary">
                  <Headphones size={16} />
                </div>
                <span className="font-medium text-gray-800">{person.name}</span>
                {person.country && countryFlags[person.country] && (
                  <span className="text-sm">{countryFlags[person.country]}</span>
                )}
              </div>
              <Arrow size={16} className="text-primary opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/register`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary/80 hover:shadow-md"
          >
            {d.registerNew}
          </Link>
        </div>
      </section>

      {mostListened.length > 0 && (
        <section className="bg-cream/20 py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">{d.mostListened}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mostListened.map((person) => (
                <Link
                  key={person.id}
                  href={`/${locale}/${person.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-cream bg-white p-4 transition hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <TrendingUp size={16} />
                    </div>
                    <span className="font-medium text-gray-800">{person.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{person.visits.toLocaleString("en-US")} {d.statsListeners}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-primary py-8 text-center">
        <p className="text-sm text-cream/80 leading-relaxed">{d.footerLine}</p>
        <p className="mt-2 text-[11px] text-cream/40">{d.copyright}</p>
      </div>
    </main>
  );
}
