import Link from "next/link";
import { AdminLoginForm } from "../components/admin-login-form";
import { BrandMark } from "../../components/brand-mark";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-[460px] rounded-[28px] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/admin" className="mb-10 flex items-center gap-3">
          <BrandMark className="text-black" />
          <span>
            <strong className="block">MotoVoix</strong>
            <small className="text-[#a1a1a1]">Admin panel</small>
          </span>
        </Link>
        <h1 className="page-title !text-[32px]">Admin sign in</h1>
        <p className="mb-8 mt-3 text-[15px] leading-relaxed text-[#a1a1a1]">Sign in with your admin account.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
