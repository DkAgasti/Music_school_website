"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiLogin } from "@/Api/admin/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function performLogin(email, password) {
    setLoading(true);
    setError("");

    const admin = await apiLogin(email, password);

    if (admin) {
      router.push("/admin");
      return;
    }

    setError("Invalid email or password.");
    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    performLogin(form.email, form.password);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm">
        {/* Logo & School Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <svg
              className="h-8 w-8 text-[#E11D48] fill-current shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <span className="font-serif text-2xl font-bold text-gray-900">
              Synchrocity Music School
            </span>
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900 mt-2">
            Admin Portal Login
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enter your credentials to access the administrative dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
              placeholder="••••••••"
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#E11D48] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#E11D48] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#BE123C] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? "Signing in..." : "Sign In to Admin Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
