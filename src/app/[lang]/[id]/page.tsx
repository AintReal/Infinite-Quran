import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, Share2 } from "lucide-react";
import { supabase, AUDIO_BUCKET, AUDIO_FOLDER } from "@/lib/supabase";
import { t, isValidLocale, type Locale } from "@/lib/i18n";
import AudioPlayer from "@/components/AudioPlayer";
import ShareButtons from "@/components/ShareButtons";
import ViewTracker from "./ViewTracker";

export const revalidate = 0;

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, id } = await params;
  const { data } = await supabase.from("deceased").select("name, companion_text").eq("id", id).eq("status", "approved").single();
  if (!data) return { title: "غير موجود" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quran.ather.sa";
  const title = `${data.name} ${data.companion_text} - وقف القرآن الكريم`;
  const description = `استمع للقرآن الكريم صدقة جارية لروح ${data.name} ${data.companion_text}`;
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
  const numId = parseInt(id);
  if (isNaN(numId)) notFound();

  const [{ data: person }, { data: audioFiles }] = await Promise.all([
    supabase.from("deceased").select("*").eq("id", numId).eq("status", "approved").single(),
    supabase.from("audio_files").select("file_name, surah_name_ar, reciter_ar").eq("is_active", true),
  ]);

  if (!person) notFound();

  const audioList = (audioFiles ?? []).map((a) => ({
    file_name: a.file_name,
    surah_name_ar: a.surah_name_ar,
    reciter_ar: a.reciter_ar,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quran.ather.sa";
  const audioBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${AUDIO_FOLDER}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-cream/40 via-white to-cream/40 px-4 py-6">
      <ViewTracker id={numId} />

      <div className="w-full max-w-md animate-fade-in">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/10 border border-cream">
          <div className="bg-primary px-6 py-4 text-center">
            <Link href={`/${locale}`} className="inline-block">
              <Image src="/logo.png" alt={d.siteTitle} width={70} height={70} className="mx-auto brightness-0 invert" />
            </Link>
          </div>

          <div className="px-6 pt-4 pb-3 text-center border-b border-cream">
            <p className="text-xs text-primary mb-2">﴿ إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ﴾</p>
            <h1 className="text-2xl font-bold text-primary md:text-3xl leading-relaxed">
              {person.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{person.companion_text}</p>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream/60 px-3 py-1 text-xs text-primary">
              <Eye size={13} />
              <span>{person.visits.toLocaleString("en-US")} {d.visits}</span>
            </div>
          </div>

          <div className="p-4">
            <AudioPlayer audioFiles={audioList} audioBaseUrl={audioBaseUrl} />
          </div>

          <div className="border-t border-cream px-6 py-4">
            <p className="mb-2 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Share2 size={13} />
              {d.shareMessage}
            </p>
            <ShareButtons url={`${siteUrl}/${locale}/${person.id}`} name={person.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
