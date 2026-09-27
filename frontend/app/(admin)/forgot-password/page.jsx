"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiForgotPassword, apiResetPassword } from "@/Api/admin/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState("email"); // "email" | "otp" | "done"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    const result = await apiForgotPassword(email);
    setLoading(false);
    if (result) setStep("otp");
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await apiResetPassword(email, otp, password);
    setLoading(false);

    if (result) {
      setStep("done");
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm">
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
            Forgot Password
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {step === "email" && "Enter your admin email and we'll send you a 6-digit OTP."}
            {step === "otp" && "Enter the OTP sent to your email and choose a new password."}
            {step === "done" && "All set!"}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#E11D48] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#BE123C] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p className="text-center text-xs text-gray-500">
              <Link href="/login" className="font-semibold text-[#E11D48] hover:underline">
                Back to Sign In
              </Link>
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleResetPassword} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                6-Digit OTP
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E11D48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all"
                placeholder="••••••••"
              />
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                onClick={() => setStep("email")}
                className="font-semibold text-[#E11D48] hover:underline cursor-pointer"
              >
                Try a different email / resend
              </button>
            </p>
          </form>
        )}

        {step === "done" && (
          <div className="mt-7 rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700 border border-emerald-100">
            Password reset successfully. Redirecting to sign in...
          </div>
        )}
      </div>
    </main>
  );
}
