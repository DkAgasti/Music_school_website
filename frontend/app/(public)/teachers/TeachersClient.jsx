"use client";

import { useState } from "react";
import TeacherCard from "@/components/public/TeacherCard";
import AdmissionNowButton from "@/components/public/AdmissionNowButton";

export default function TeachersClient({ teachers }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <div className="w-full flex flex-col bg-[#FFF9FA] text-gray-900 antialiased">
      {/* ── 1. Hero Header Section with Right Magenta Glow Wave ───────────── */}
      <section className="relative w-full overflow-hidden bg-white border-b border-pink-50/60 py-10 sm:py-12 md:py-14">
        {/* Soft Ambient Magenta Gradient Wave on Right */}
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 select-none overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 90% 120% at 100% 50%, rgba(216, 27, 96, 0.85) 0%, rgba(244, 114, 182, 0.5) 45%, rgba(255, 255, 255, 0) 80%)
            `,
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-gray-900 tracking-tight leading-tight">
            Our Teachers
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 font-normal max-w-xl">
            Learn from passionate and experienced instructors.
          </p>
        </div>
      </section>

      {/* ── 2. Teachers Grid Section ──────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-6 pt-10 sm:pt-12 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onSelect={(t) => setSelectedTeacher(t)}
            />
          ))}
        </div>

        {/* ── 3. Bottom Call To Action (CTA) Banner ────────────────────────── */}
        <div className="mt-14 sm:mt-16 rounded-2xl sm:rounded-3xl bg-[#FDF0F3] border border-pink-100/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
            <div className="shrink-0 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-[#E11D48] fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                Learn from the best in the industry
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 font-normal">
                Join a class and start your musical journey with our expert teachers.
              </p>
            </div>
          </div>

          <AdmissionNowButton className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#D81B60] transition-colors self-start sm:self-auto">
            <span>Admission Now</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </AdmissionNowButton>
        </div>
      </main>

      {/* ── 4. Interactive Teacher Profile Modal ──────────────────────────── */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Banner */}
            <div className="relative h-32 w-full bg-gradient-to-r from-[#F29BB9] via-[#EA84A9] to-[#D8578B] p-4 flex items-end justify-between">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 text-gray-700 hover:bg-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-white">
                <span className="inline-block rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                  {selectedTeacher.experience || "Experienced Faculty"}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h3 className="font-serif text-2xl font-bold text-gray-900">
                {selectedTeacher.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#E11D48]">
                {selectedTeacher.role}
              </p>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {selectedTeacher.bio || "Dedicated mentor guiding students through comprehensive music education and performance excellence."}
              </p>

              {selectedTeacher.classes && selectedTeacher.classes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Courses Taught
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeacher.classes.map((cls, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-medium text-[#E11D48]"
                      >
                        {cls.name || cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(null)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <AdmissionNowButton className="rounded-lg bg-[#E11D48] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#D81B60] transition-colors">
                  Apply for Admission
                </AdmissionNowButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
