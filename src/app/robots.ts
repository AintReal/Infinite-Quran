import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quran.ather.sa";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/control", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
