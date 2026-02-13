"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { X, PartyPopper } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

type Props = {
  url: string;
  name: string;
  d: {
    congratsTitle: string;
    congratsDesc: string;
    congratsShare: string;
    congratsClose: string;
  };
};

export default function CongratsPopup({ url, name, d }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setShow(true);
  }, [searchParams]);

  const close = () => {
    setShow(false);
    router.replace(window.location.pathname, { scroll: false });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-fade-in"
      >
        <button onClick={close} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition">
          <X size={20} />
        </button>

        <PartyPopper size={48} className="mx-auto mb-4 text-primary" />

        <h2 className="text-xl font-bold text-primary mb-2">{d.congratsTitle}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{d.congratsDesc}</p>

        <p className="text-xs text-gray-400 mb-3">{d.congratsShare}</p>
        <ShareButtons url={url} name={name} />

        <button
          onClick={close}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/80"
        >
          {d.congratsClose}
        </button>
      </div>
    </div>
  );
}
