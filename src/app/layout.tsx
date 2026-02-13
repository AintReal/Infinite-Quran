import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quranwaqf.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "الإذاعة القرآنية | إذاعة قرآنية على مدار الساعة",
    template: "%s | الإذاعة القرآنية",
  },
  description: "صدقة جارية - إذاعة قرآنية على مدار الساعة. أنشئ صفحة قرآنية لمن تحب.",
  keywords: ["قرآن", "صدقة جارية", "إذاعة قرآنية", "صفحة قرآنية", "quran", "radio", "sadaqah"],
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
    siteName: "الإذاعة القرآنية",
    title: "الإذاعة القرآنية | إذاعة قرآنية على مدار الساعة",
    description: "صدقة جارية - إذاعة قرآنية على مدار الساعة",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: "الإذاعة القرآنية" }],
  },
  twitter: {
    card: "summary",
    title: "الإذاعة القرآنية",
    description: "صدقة جارية - إذاعة قرآنية على مدار الساعة",
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
