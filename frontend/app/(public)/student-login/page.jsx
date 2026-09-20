"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import AdmissionNowButton from "@/components/public/AdmissionNowButton";
import { loginStudent } from "@/lib/api";
import { setStudentToken } from "@/lib/studentAuth";

export default function StudentLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await loginStudent(form);
      setStudentToken(token);
      router.push("/student");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center bg-[#FFF7F9] px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-pink-100/70 bg-white p-7 sm:p-8">
          <h1 className="font-serif text-2xl font-bold text-gray-900">Student Login</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-800">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-800">Password</span>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#E11D48] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Not a student yet?{" "}
            <AdmissionNowButton className="font-semibold text-[#E11D48] hover:text-[#D81B60]">
              Apply for admission
            </AdmissionNowButton>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
