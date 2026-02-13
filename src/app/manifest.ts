import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "الإذاعة القرآنية",
    short_name: "الإذاعة القرآنية",
    description: "صدقة جارية - إذاعة قرآنية على مدار الساعة",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006001",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
