"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Trash2, CheckCircle, Pause, LogOut, ExternalLink, Copy, Check, FileText, Eye, Clock, Pencil, X, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deceased } from "@/lib/types";

type Stats = {
  totalPages: number;
  totalVisits: number;
  periodPages: number;
  status: { pending: number; approved: number; rejected: number };
  chartData: { date: string; count: number }[];
};

const PERIODS = [
  { key: "1", label: "اليوم" },
  { key: "7", label: "7 أيام" },
  { key: "30", label: "30 يوم" },
  { key: "120", label: "120 يوم" },
  { key: "365", label: "سنة" },
  { key: "all", label: "الكل" },
] as const;

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("30");
  const [editing, setEditing] = useState<Deceased | null>(null);
  const [saving, setSaving] = useState(false);

  const copyLink = async (id: number) => {
    await navigator.clipboard.writeText(`https://quranwaqf.com/ar/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/admin/stats?period=${period}`);
    if (res.status === 401) { router.push("/control/login"); return; }
    setStats(await res.json());
  }, [period, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sortBy) params.set("sort", sortBy);
    const res = await fetch(`/api/admin/deceased?${params}`);
    if (res.status === 401) { router.push("/control/login"); return; }
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, search, statusFilter, sortBy, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/deceased", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchData(); fetchStats();
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/admin/deceased", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchData(); fetchStats();
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/admin/deceased", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        name: editing.name,
        companion_text: editing.companion_text,
        country: editing.country,
        status: editing.status,
      }),
    });
    setSaving(false);
    setEditing(null);
    fetchData(); fetchStats();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/control/login");
  };

  const totalPages = Math.ceil(total / 20);
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? period;
  const isHourly = period === "1";

  const statusBadge = (s: string) => {
    const cls = s === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" : s === "rejected" ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    const label = s === "approved" ? "مفعّل" : s === "rejected" ? "مرفوض" : "معلّق";
    return <Badge variant="secondary" className={cls}>{label}</Badge>;
  };

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><Image src="/logo.png" alt="" width={36} height={36} /></Link>
            <h1 className="text-lg font-bold text-primary">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/control/reports" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
              <AlertTriangle size={16} /> البلاغات
            </Link>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Period Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-gray-200 w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${period === p.key ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-primary" /><p className="text-xs text-gray-400">إجمالي الصفحات</p></div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPages.toLocaleString("en-US")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-blue-500" /><p className="text-xs text-gray-400">صفحات ({periodLabel})</p></div>
                <p className="text-2xl font-bold text-gray-800">{stats.periodPages.toLocaleString("en-US")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Eye size={14} className="text-primary" /><p className="text-xs text-gray-400">إجمالي الزيارات</p></div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalVisits.toLocaleString("en-US")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-green-500" /><p className="text-xs text-gray-400">مفعّل</p></div>
                <p className="text-2xl font-bold text-green-600">{stats.status.approved.toLocaleString("en-US")}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-yellow-500" /><p className="text-xs text-gray-400">معلّق</p>
                  <span className="mr-auto"><Pause size={14} className="text-red-400" /></span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-yellow-600">{stats.status.pending.toLocaleString("en-US")}</p>
                  <span className="text-xs text-gray-300">|</span>
                  <p className="text-2xl font-bold text-red-500">{stats.status.rejected.toLocaleString("en-US")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart */}
        {stats && stats.chartData.length > 0 && (
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="pt-5 pr-1 pb-3 pl-4">
              <p className="text-sm font-medium text-gray-500 mb-3 pr-3">الصفحات المُنشأة — {periodLabel}</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="fillPages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(120,100%,19%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(120,100%,19%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => isHourly ? d : d.slice(5)}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={isHourly ? 2 : Math.max(0, Math.floor(stats.chartData.length / 12))}
                    />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={35} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      labelFormatter={(d: string) => isHourly ? d : new Date(d).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                      formatter={(v: number) => [v.toLocaleString("en-US"), "صفحة"]}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(120,100%,19%)" fill="url(#fillPages)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث بالاسم..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="">الكل</option>
            <option value="approved">مفعّل</option>
            <option value="pending">معلّق</option>
            <option value="rejected">مرفوض</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">الأحدث</option>
            <option value="most_views">الأكثر زيارة</option>
          </select>
        </div>

        {/* Table */}
        <Card className="shadow-sm border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">#</th>
                  <th className="px-4 py-3 text-right font-medium">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">الزيارات</th>
                  <th className="px-4 py-3 text-right font-medium">الدولة</th>
                  <th className="px-4 py-3 text-right font-medium">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">لا توجد نتائج</td></tr>
                ) : (
                  data.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 text-gray-400 text-xs">{d.id}</td>
                      <td className="px-4 py-3 font-medium">{d.name}</td>
                      <td className="px-4 py-3">{statusBadge(d.status)}</td>
                      <td className="px-4 py-3 text-gray-500">{d.visits.toLocaleString("en-US")}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.country}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`/ar/${d.id}`} target="_blank" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary transition">
                            <ExternalLink size={15} />
                          </a>
                          <button onClick={() => copyLink(d.id)} className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition" title="نسخ الرابط">
                            {copiedId === d.id ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                          </button>
                          <button onClick={() => setEditing({ ...d })} className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition" title="تعديل">
                            <Pencil size={15} />
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
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30 transition hover:bg-gray-100">السابق</button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30 transition hover:bg-gray-100">التالي</button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">تعديل — #{editing.id}</h2>
              <button onClick={() => setEditing(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">الاسم</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">النص المصاحب</label>
                <input
                  value={editing.companion_text}
                  onChange={(e) => setEditing({ ...editing, companion_text: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">الدولة</label>
                <input
                  value={editing.country}
                  onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">الحالة</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Deceased["status"] })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary transition"
                >
                  <option value="approved">مفعّل</option>
                  <option value="pending">معلّق</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary/80 disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
