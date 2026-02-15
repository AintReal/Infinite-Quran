import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Image src="/logo.png" alt="" width={50} height={50} />
      <h1 className="text-2xl font-bold text-primary">الصفحة غير موجودة</h1>
      <p className="text-sm text-gray-500">الرابط الذي تبحث عنه غير موجود أو تم حذفه</p>
      <Link href="/" className="mt-2 text-sm font-medium text-primary underline underline-offset-4">
        العودة للرئيسية
      </Link>
      <Link
        href="/ar/register"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary/80"
      >
        أنشئ صفحة قرآنية
      </Link>
    </main>
  );
}
