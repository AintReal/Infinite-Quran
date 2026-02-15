"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  pageId: number;
  d: {
    reportProblem: string;
    reportName: string;
    reportContact: string;
    reportMessage: string;
    reportSend: string;
    reportSending: string;
    reportSuccess: string;
    reportError: string;
  };
};

export default function ReportForm({ pageId, d }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"ok" | "err" | null>(null);

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: pageId, name, contact, message }),
      });
      if (res.ok) {
        setResult("ok");
        setName("");
        setContact("");
        setMessage("");
      } else {
        setResult("err");
      }
    } catch {
      setResult("err");
    }
    setSending(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => { setOpen(!open); setResult(null); }}
        className="mx-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
      >
        <AlertTriangle size={12} />
        {d.reportProblem}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-white p-4 animate-fade-in">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={d.reportName}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={d.reportContact}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={d.reportMessage}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition resize-none"
          />
          <button
            onClick={submit}
            disabled={sending || !message.trim()}
            className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {sending ? d.reportSending : d.reportSend}
          </button>
          {result === "ok" && <p className="text-xs text-green-600 text-center">{d.reportSuccess}</p>}
          {result === "err" && <p className="text-xs text-red-500 text-center">{d.reportError}</p>}
        </div>
      )}
    </div>
  );
}
