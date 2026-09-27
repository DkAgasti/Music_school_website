"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetSiteSettings } from "@/Api/public/siteSettingsApi";

function NoteIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export default function NotFoundClient() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiGetSiteSettings().then(setSettings);
  }, []);

  const supportEmail = settings?.email || "info@harmonymusic.in";
  const heroImage = "https://res.cloudinary.com/vpetrpeu/image/upload/v1790351674/404.png";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#FFF9F6]">
      {/* Decorative music staff, bottom-left */}
      <svg
        className="pointer-events-none absolute bottom-24 left-0 h-24 w-72 text-[#E11D48]/10 sm:bottom-28"
        viewBox="0 0 300 100"
        fill="none"
        aria-hidden="true"
      >
        {[15, 35, 55, 75, 95].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeWidth="2" />
        ))}
      </svg>
      <NoteIcon className="pointer-events-none absolute bottom-28 left-10 h-7 w-7 -rotate-12 text-[#E11D48]/20" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-20">
        {/* Left: copy */}
        <div className="max-w-xl text-center lg:text-left">
          <div className="relative inline-block">
            <span
              className="pointer-events-none absolute -left-6 -top-6 h-40 w-56 rounded-full bg-[#F9A8D4]/30 blur-3xl"
              aria-hidden="true"
            />
            <span className="relative font-serif text-[6.5rem] font-bold leading-none text-[#D6296A] sm:text-[9rem]">
              404
            </span>
            <NoteIcon className="absolute -right-5 top-0 h-7 w-7 rotate-12 text-[#D6296A] sm:-right-7 sm:h-9 sm:w-9" />
          </div>

          <h1 className="mt-1 font-serif text-4xl font-bold text-[#1a1a2e] sm:text-5xl">
            Page Not Found
          </h1>

          <p className="mt-4 text-base leading-relaxed text-gray-500">
            Oops! Looks like the page you&apos;re looking for has gone off-key. Don&apos;t worry, it happens!
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex w-max items-center gap-2 whitespace-nowrap rounded-full bg-[#E11D48] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md"
          >
            <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
            <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Right: illustration */}
        <div className="w-full max-w-md shrink-0 lg:max-w-lg">
          <img
            src={heroImage}
            alt="A guitar with musical notes floating around it"
            className="w-full object-contain"
          />
        </div>
      </main>

      {/* Footer strip */}
      <div className="relative border-t border-gray-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5 text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
              </svg>
              <span className="whitespace-nowrap">
                <span className="font-semibold text-gray-900">Need help?</span> Get in touch with our support team
              </span>
            </p>
            <p className="flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${supportEmail}`} className="hover:text-[#E11D48] hover:underline">
                {supportEmail}
              </a>
            </p>
          </div>

          <p className="flex items-center gap-1.5 font-script text-2xl text-[#E11D48]">
            Keep Playing
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.716-4.35-9.428-8.06C.88 10.31 1.2 6.6 4.2 4.9c2.3-1.3 4.9-.6 6.3 1.3l1.5 2 1.5-2c1.4-1.9 4-2.6 6.3-1.3 3 1.7 3.32 5.41 1.63 8.04C18.716 16.65 12 21 12 21z" />
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
}
