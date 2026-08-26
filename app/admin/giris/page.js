import Link from "next/link";
import { AdminLoginForm } from "../components/admin-login-form";
import { BrandMark } from "../../components/brand-mark";

export const metadata = { title: "Yönetici girişi | MotoVoix" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-[460px] rounded-[28px] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/admin" className="mb-10 flex items-center gap-3">
          <BrandMark className="text-black" />
          <span>
            <strong className="block">MotoVoix</strong>
            <small className="text-[#a1a1a1]">Yönetim paneli</small>
          </span>
        </Link>
        <h1 className="page-title !text-[32px]">Yönetici girişi</h1>
        <p className="mb-8 mt-3 text-[15px] leading-relaxed text-[#a1a1a1]">Demo panel için yerel veritabanı kullanılır. Şifre site girişi ile aynıdır.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
