"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

const langs: Record<Locale, { flag: string; name: string }> = {
  ar: { flag: "🇸🇦", name: "العربية" },
  en: { flag: "🇬🇧", name: "English" },
  id: { flag: "🇮🇩", name: "Indonesia" },
  fr: { flag: "🇫🇷", name: "Français" },
};

export default function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchTo = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <div ref={ref} dir="ltr" className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-2 text-white transition hover:bg-white/25"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{langs[current].flag} {langs[current].name}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 min-w-[160px] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/10 z-50">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={switchTo(locale)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition ${
                locale === current
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{langs[locale].flag}</span>
              <span>{langs[locale].name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
