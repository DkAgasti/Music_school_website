"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmission } from "@/context/AdmissionContext";
import { apiGetSiteSettings } from "@/Api/public/siteSettingsApi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Classes" },
  { href: "/teachers", label: "Teachers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const { openAdmission } = useAdmission();

  useEffect(() => {
    apiGetSiteSettings().then(setSettings);
  }, []);

  const businessName = settings?.businessName || "Synchrocity Music School";
  const tagline = settings?.tagline || "Learn · Play · Grow";

  const handleAdmissionClick = () => {
    let currentClass = null;
    if (pathname && pathname.startsWith("/classes/")) {
      const slug = pathname.replace("/classes/", "").split("/")[0];
      if (slug) {
        currentClass = slug;
      }
    }
    openAdmission(currentClass ? { selectedClass: currentClass } : null);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <nav className="flex w-full items-center justify-between px-5 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={businessName}
              className="h-14 w-14 rounded-lg object-contain shrink-0 transition-transform group-hover:scale-105"
            />
          ) : (
            <svg
              className="h-7 w-7 text-[#E11D48] fill-current shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-bold text-gray-900 leading-tight">
              {businessName}
            </span>
            <span className="text-[10px] text-gray-400 font-normal tracking-wide leading-tight mt-0.5">
              {tagline}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#E11D48] font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] rounded-full bg-[#E11D48]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/student-login"
            className="hidden items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-[#E11D48] hover:text-[#E11D48] sm:flex sm:text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Student
          </Link>

          <button
            type="button"
            onClick={handleAdmissionClick}
            className="hidden rounded-full bg-[#E11D48] px-6 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60] hover:shadow-md cursor-pointer md:inline-flex md:text-sm"
          >
            Admission
          </button>

          {/* Mobile menu trigger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm py-1.5 ${
                    isActive
                      ? "font-bold text-[#D8006E]"
                      : "font-medium text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/student-login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 w-full rounded-full border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-700 hover:border-[#E11D48] hover:text-[#E11D48]"
            >
              Student Login
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleAdmissionClick();
              }}
              className="w-full rounded-full bg-[#E11D48] py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#D81B60]"
            >
              Admission
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
