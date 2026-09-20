"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStudentToken } from "@/lib/studentAuth";

const ICONS = {
  home: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  user: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  ),
  plusSquare: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </>
  ),
  activity: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l2.5-4 2 3L15 8l2 3" />
    </>
  ),
  fileText: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM13 3v5h5M9 13h6M9 17h6" />
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8v11a1 1 0 001 1h14a1 1 0 001-1V8M10 13h4" />
    </>
  ),
};

function Icon({ name, className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {ICONS[name]}
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/student", label: "Dashboard", icon: "home" },
  { href: "/student/profile", label: "Profile", icon: "user" },
  { href: "/student/classes", label: "Enrolled Classes", icon: "plusSquare" },
  { href: "/student/attendance", label: "Attendance", icon: "clock" },
  { href: "/student/progress", label: "Progress Tracker", icon: "activity" },
  { href: "/student/payments", label: "Payment History", icon: "fileText" },
  { href: "/student/admissions", label: "Past Admissions", icon: "archive" },
];

export default function StudentSidebar({ isOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearStudentToken();
    router.push("/student-login");
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col justify-between border-r border-pink-100/70 bg-white px-4 py-6 transition-transform duration-200 ease-in-out sm:px-5 lg:static lg:z-auto lg:translate-x-0 ${
        isOpen ? "translate-x-0" : ""
      }`}
    >
      <div>
        <div className="mb-4 flex items-center justify-end lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-pink-50"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/student" ? pathname === "/student" : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-900 font-semibold text-white shadow-sm"
                    : "text-gray-600 hover:bg-pink-50"
                }`}
              >
                <Icon name={link.icon} className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 transition-colors hover:bg-pink-50 hover:text-[#E11D48]"
      >
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m4 6H5a2 2 0 01-2-2V6a2 2 0 012-2h6" />
        </svg>
        Logout
      </button>
    </aside>
  );
}
