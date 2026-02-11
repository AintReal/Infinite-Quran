import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quran.ather.sa";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وقف القرآن الكريم | إذاعة قرآنية على مدار الساعة",
    template: "%s | وقف القرآن الكريم",
  },
  description: "صدقة جارية - إذاعة قرآنية على مدار الساعة لروح المتوفى. سجّل اسم المتوفى واجعل القرآن يُتلى له على مدار الساعة.",
  keywords: ["وقف", "قرآن", "صدقة جارية", "متوفى", "إذاعة قرآنية", "quran", "waqf", "sadaqah"],
  authors: [{ name: "Ather" }],
  creator: "Ather",
  publisher: "Ather",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: siteUrl,
    siteName: "وقف القرآن الكريم",
    title: "وقف القرآن الكريم | إذاعة قرآنية على مدار الساعة",
    description: "صدقة جارية - إذاعة قرآنية على مدار الساعة لروح المتوفى",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: "وقف القرآن الكريم" }],
  },
  twitter: {
    card: "summary",
    title: "وقف القرآن الكريم",
    description: "صدقة جارية - إذاعة قرآنية على مدار الساعة لروح المتوفى",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "religion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* <head>
        <script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} async defer />
      </head> */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
