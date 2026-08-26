import Link from "next/link";
import ThemeToggle from "./components/theme-toggle";
import LoginForm from "./components/login-form";

export const metadata = {
  title: "Login | MotoVoix",
  description: "Static login screen for MotoVoix.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f4f2]">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 md:right-8">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-[28px] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 sm:p-8 md:p-10">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="brand-logo block text-center text-4xl font-semibold tracking-tight text-[#1e1d1c] sm:text-5xl">
              MOTOVOIX
            </Link>
          </div>

          <LoginForm />
          <p className="mt-6 text-center text-sm text-[#8a8a8a]">
            <Link className="underline-offset-4 hover:underline" href="/admin/giris">
              Yönetim paneli
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
