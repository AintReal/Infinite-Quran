import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { locales } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quranwaqf.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: deceased } = await supabase
    .from("deceased")
    .select("id, updated_at")
    .eq("status", "approved")
    .order("id", { ascending: true });

  const personPages: MetadataRoute.Sitemap = (deceased ?? []).map((d) => ({
    url: `${siteUrl}/ar/${d.id}`,
    lastModified: d.updated_at ?? new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const langPages: MetadataRoute.Sitemap = locales.flatMap((lang) => [
    {
      url: `${siteUrl}/${lang}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: lang === "ar" ? 1.0 : 0.9,
    },
    {
      url: `${siteUrl}/${lang}/register`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ]);

  return [...langPages, ...personPages];
}
