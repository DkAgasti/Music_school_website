"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetSiteSettings } from "@/Api/public/siteSettingsApi";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/classes", label: "Classes" },
  { href: "/teachers", label: "Teachers" },
  { href: "/gallery", label: "Gallery" },
];

export default function Footer({ theme = "light" }) {
  const isLight = theme === "light";
  const [settings, setSettings] = useState({});

  useEffect(() => {
    apiGetSiteSettings().then((res) => setSettings(res || {}));
  }, []);

  const businessName = settings.businessName || "Synchrocity Music School";
  const tagline = settings.tagline || "Learn · Play · Grow";
  const phone = settings.phone || "+91 98765 43210";
  const email = settings.email || "info@harmonymusic.in";
  const address = settings.address || "123 Music Lane, Green Park\nNew Delhi – 110016";
  const copyrightYear = new Date().getFullYear();

  return (
    <footer className={isLight ? "bg-[#FFF7FB] text-gray-600" : "bg-dark text-gray-400"}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 pb-14 sm:pt-10 sm:pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={businessName}
                className="h-14 w-14 rounded-lg object-contain shrink-0"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBF5] text-[#E11D48] shrink-0">
                <span className="text-xl leading-none font-bold">&#9835;</span>
              </div>
            )}
            <div>
              <span className={`block font-serif text-base font-bold leading-tight ${isLight ? "text-gray-900" : "text-white"}`}>
                {businessName}
              </span>
              <span className="block text-[11px] text-gray-500 font-normal leading-tight mt-0.5">
                {tagline}
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className={`mb-4 text-sm font-bold tracking-wide ${isLight ? "text-gray-900" : "text-white uppercase tracking-wider"}`}>
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors ${isLight ? "text-gray-600 hover:text-brand-500" : "text-gray-400 hover:text-brand-400"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className={`mb-4 text-sm font-bold tracking-wide ${isLight ? "text-gray-900" : "text-white uppercase tracking-wider"}`}>
            Contact Us
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-brand-500 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <span>{phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-brand-500 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <span>{email}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center text-brand-500 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span className="whitespace-pre-line">{address}</span>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className={`mb-4 text-sm font-bold tracking-wide ${isLight ? "text-gray-900" : "text-white uppercase tracking-wider"}`}>
            Follow Us
          </h4>
          <div className="flex gap-2.5">
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] text-white transition-all hover:bg-brand-500 hover:scale-105"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            {/* Twitter / X */}
            <a
              href="#"
              aria-label="Twitter"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] text-white transition-all hover:bg-brand-500 hover:scale-105"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] text-white transition-all hover:bg-brand-500 hover:scale-105"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={isLight ? "border-t border-pink-100/70" : "border-t border-white/10"}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-5 text-center text-xs text-gray-500 sm:grid sm:grid-cols-3 sm:text-left">
          <p className="sm:justify-self-start">&copy; {copyrightYear} {businessName}. All rights reserved.</p>
          <a
            href="https://codeprodev.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-brand-500 sm:justify-self-center"
          >
            <img
              src="https://res.cloudinary.com/fexwwils/image/upload/v1790493493/CodePro_Logo2.png"
              alt="CodePro"
              className="h-8 w-8 shrink-0 object-contain"
            />
            Built by <span className="font-bold text-dark">CodePro</span>
          </a>
          <div className="flex gap-4 sm:justify-self-end">
            <Link href="/privacy-policy" className="hover:text-brand-500">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-brand-500">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
