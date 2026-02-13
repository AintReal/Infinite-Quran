"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Trash2, CheckCircle, XCircle, Pause, LogOut, ExternalLink, Copy, Check } from "lucide-react";
import type { Deceased } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Deceased[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyLink = async (id: number) => {
    await navigator.clipboard.writeText(`https://quranwaqf.com/ar/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sortBy) params.set("sort", sortBy);

    const res = await fetch(`/api/admin/deceased?${params}`);
    if (res.status === 401) {
      router.push("/control/login");
      return;
    }
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, search, statusFilter, sortBy, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/deceased", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/admin/deceased", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/control/login");
  };

  const totalPages = Math.ceil(total / 20);

  const statusBadge = (s: string) => {
    const cls = s === "approved" ? "bg-green-100 text-green-700" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
    const label = s === "approved" ? "مفعّل" : s === "rejected" ? "مرفوض" : "معلّق";
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><Image src="/logo.png" alt="" width={36} height={36} /></Link>
            <h1 className="text-lg font-bold text-primary">لوحة التحكم</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
            <LogOut size={16} /> خروج
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي السجلات</p>
            <p className="text-2xl font-bold text-primary">{total.toLocaleString("en-US")}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث بالاسم..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="">الكل</option>
            <option value="approved">مفعّل</option>
            <option value="pending">معلّق</option>
            <option value="rejected">مرفوض</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">الأحدث</option>
            <option value="most_views">الأكثر زيارة</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-right">#</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الزيارات</th>
                <th className="px-4 py-3 text-right">الدولة</th>
                <th className="px-4 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">جاري التحميل...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">لا توجد نتائج</td></tr>
              ) : (
                data.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400">{d.id}</td>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3 text-gray-500">{d.visits.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-gray-500">{d.country}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a href={`/${d.id}`} target="_blank" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary transition">
                          <ExternalLink size={15} />
                        </a>
                        <button onClick={() => copyLink(d.id)} className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition" title="نسخ الرابط">
                          {copiedId === d.id ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                        </button>
                        {d.status !== "approved" && (
                          <button onClick={() => updateStatus(d.id, "approved")} className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600 transition">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {d.status !== "rejected" && (
                          <button onClick={() => updateStatus(d.id, "rejected")} className="rounded p-1 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition">
                            <Pause size={15} />
                          </button>
                        )}
                        <button onClick={() => remove(d.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30"
            >
              السابق
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
