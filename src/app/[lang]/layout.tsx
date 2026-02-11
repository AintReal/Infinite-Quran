import { isRtl, isValidLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const locale = lang as Locale;

  return (
    <div dir={isRtl(locale) ? "rtl" : "ltr"} lang={locale}>
      {children}
    </div>
  );
}
