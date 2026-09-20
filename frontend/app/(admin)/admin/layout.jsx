"use client";

import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#FFF7FB]">
        {/* Sidebar - Desktop static & Mobile drawer */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
          {/* Mobile Top Header Bar (Shown ONLY on mobile screens < md) */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#F3E2EC] shrink-0 z-30">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-700 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer border border-[#F3E2EC] shadow-xs"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#FDEEF5] text-[#E11D48] flex items-center justify-center shrink-0 border border-[#F9EBF2]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <span className="font-serif text-sm font-bold text-gray-900">
                Harmony Music
              </span>
            </div>

            <div className="w-9"></div>
          </header>

          {/* Page Scrollable Area */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
