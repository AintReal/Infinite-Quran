"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, ArrowRight, Trash2, Mail, MailOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Report = {
  id: number;
  page_id: number | null;
  name: string | null;
  contact: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  deceased: { id: number; name: string } | null;
};

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (filter) params.set("filter", filter);
    const res = await fetch(`/api/admin/reports?${params}`);
    if (res.status === 401) { router.push("/control/login"); return; }
    const json = await res.json();
    setReports(json.data || []);
    setTotal(json.total || 0);
    setUnread(json.unread || 0);
    setLoading(false);
  }, [page, filter, router]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const toggleRead = async (id: number, current: boolean) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_read: !current }),
    });
    fetchReports();
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/admin/reports", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchReports();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/control/login");
  };

  const totalPages = Math.ceil(total / 20);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><Image src="/logo.png" alt="" width={36} height={36} /></Link>
            <h1 className="text-lg font-bold text-primary">البلاغات</h1>
            {unread > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">{unread} جديد</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/control" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
              <ArrowRight size={16} /> لوحة التحكم
            </Link>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setFilter(""); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${!filter ? "bg-primary text-white" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
          >
            الكل ({total})
          </button>
          <button
            onClick={() => { setFilter("unread"); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === "unread" ? "bg-primary text-white" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
          >
            غير مقروء ({unread})
          </button>
        </div>

        {/* Reports */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <p className="py-12 text-center text-gray-400">لا توجد بلاغات</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className={`p-4 shadow-sm border-0 ${!r.is_read ? "bg-primary/5 border-r-4 !border-r-primary" : "bg-white"}`}>
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.name && <span className="font-medium text-gray-800 text-sm">{r.name}</span>}
                      {r.contact && <span className="text-xs text-gray-400">{r.contact}</span>}
                      {r.deceased && (
                        <Link
                          href={`/ar/${r.deceased.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink size={11} />
                          {r.deceased.name}
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleRead(r.id, r.is_read)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 transition"
                      title={r.is_read ? "تحديد كغير مقروء" : "تحديد كمقروء"}
                    >
                      {r.is_read ? <MailOpen size={15} /> : <Mail size={15} />}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30 transition hover:bg-gray-100">السابق</button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30 transition hover:bg-gray-100">التالي</button>
          </div>
        )}
      </div>
    </main>
  );
}
