import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, AUDIO_BUCKET, AUDIO_FOLDER } from "@/lib/supabase";
import { t, isValidLocale, isRtl, type Locale } from "@/lib/i18n";
import AudioPlayer from "@/components/AudioPlayer";
import ShareButtons from "@/components/ShareButtons";
import ReportForm from "@/components/ReportForm";
import ViewTracker from "./ViewTracker";
import CongratsPopup from "./CongratsPopup";

export const revalidate = 0;

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, id } = await params;
  const { data } = await supabase.from("deceased").select("name, companion_text").eq("id", id).eq("status", "approved").single();
  if (!data) return { title: "غير موجود" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quranwaqf.com";
  const title = `${data.name} ${data.companion_text} - إذاعة قرآنية`;
  const description = `استمع للقرآن الكريم — إذاعة قرآنية لـ ${data.name} ${data.companion_text}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/${id}`,
      images: [{ url: "/og-image.png", width: 512, height: 512, alt: data.name }],
    },
    twitter: { card: "summary", title, description, images: ["/og-image.png"] },
  };
}

export default async function SlugPage({ params }: Props) {
  const { lang, id } = await params;
  if (!isValidLocale(lang)) notFound();
  const locale = lang as Locale;
  const d = t(locale);
  const rtl = isRtl(locale);
  const numId = parseInt(id);
  if (isNaN(numId)) notFound();

  const [{ data: person }, { data: audioFiles }, { data: prevRow }, { data: nextRow }] = await Promise.all([
    supabase.from("deceased").select("*").eq("id", numId).eq("status", "approved").single(),
    supabase.from("audio_files").select("file_name, surah_name_ar, reciter_ar").eq("is_active", true),
    supabase.from("deceased").select("id").eq("status", "approved").lt("id", numId).order("id", { ascending: false }).limit(1).single(),
    supabase.from("deceased").select("id").eq("status", "approved").gt("id", numId).order("id", { ascending: true }).limit(1).single(),
  ]);

  if (!person) notFound();

  const prevId = prevRow?.id ?? null;
  const nextId = nextRow?.id ?? null;

  const audioList = (audioFiles ?? []).map((a) => ({
    file_name: a.file_name,
    surah_name_ar: a.surah_name_ar,
    reciter_ar: a.reciter_ar,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quranwaqf.com";
  const audioBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${AUDIO_FOLDER}`;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 overflow-hidden" style={{ backgroundColor: "#F5EFE0" }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23006001' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <ViewTracker id={numId} />
      <CongratsPopup url={`${siteUrl}/${locale}/${person.id}`} name={person.name} companionText={person.companion_text} d={d} />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/10 border border-cream">
          <div className="bg-primary px-6 py-6 text-center">
            <Link href={`/${locale}`} className="inline-block">
              <Image src="/logo.png" alt={d.siteTitle} width={80} height={80} className="mx-auto brightness-0 invert" />
            </Link>
          </div>

          <div className="px-8 pt-6 pb-5 text-center border-b border-cream">
            <h1 className="text-4xl font-bold text-primary md:text-5xl leading-snug">
              {person.name}
            </h1>
            <p className="mt-3 text-base text-gray-500">{person.companion_text}</p>
          </div>

          <div className="p-6">
            <AudioPlayer audioFiles={audioList} audioBaseUrl={audioBaseUrl} />
          </div>

          <div className="border-t border-cream px-8 py-5 text-center">
            <p dir="rtl" className="text-xs text-primary/60 mb-2">﴿ إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ﴾</p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cream/60 px-4 py-1.5 text-sm text-primary">
              <Eye size={14} />
              <span>{person.visits.toLocaleString("en-US")} {d.visits}</span>
            </div>
          </div>

          <div className="border-t border-cream px-8 py-6">
            <p className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Share2 size={13} />
              {d.shareMessage}
            </p>
            <ShareButtons url={`${siteUrl}/${locale}/${person.id}`} name={person.name} companionText={person.companion_text} />
          </div>
        </div>

        <Link
          href={`/${locale}/register`}
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white py-4 text-sm font-bold text-primary shadow-sm transition hover:bg-cream/30"
        >
          {d.createYourOwn}
        </Link>

        <div className="mt-4 flex items-center justify-between">
          {prevId ? (
            <Link
              href={`/${locale}/${prevId}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-cream shadow-sm text-primary transition hover:bg-cream/30"
            >
              {rtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Link>
          ) : <span />}
          {nextId ? (
            <Link
              href={`/${locale}/${nextId}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-cream shadow-sm text-primary transition hover:bg-cream/30"
            >
              {rtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Link>
          ) : <span />}
        </div>

        <ReportForm pageId={numId} d={d} />
      </div>
    </main>
  );
}
